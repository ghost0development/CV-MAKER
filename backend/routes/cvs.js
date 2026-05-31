import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, all, run } from '../database.js';
import { authenticate } from '../middleware/auth.js';
import PDFDocument from 'pdfkit';

function detectLang(data) {
  const pc = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
  const fields = [data.summary, data.title, ...(data.experience||[]).flatMap(e=>[e.position,e.company,e.description]),
    ...(data.education||[]).flatMap(e=>[e.degree,e.institution]), ...(data.projects||[]).flatMap(e=>[e.name,e.description])];
  const p = fields.filter(f=>f&&pc.test(f)).length;
  const t = fields.filter(f=>f).length;
  return t && p/t > 0.3 ? 'pl' : 'en';
}

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const cvs = await all('SELECT id, title, template, theme, font, is_public, share_link, created_at, updated_at FROM cvs WHERE user_id = ? ORDER BY updated_at DESC', [req.userId]);
    res.json(cvs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const cv = await get('SELECT * FROM cvs WHERE id = ? AND (user_id = ? OR is_public = 1)', [req.params.id, req.userId]);
    if (!cv) return res.status(404).json({ error: 'CV nie znalezione' });
    res.json(cv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { title, template, theme, font, data } = req.body;
    const id = uuidv4();
    const defaultData = {
      photo: null, firstName: '', lastName: '', title: '', email: '', phone: '',
      location: '', website: '', linkedin: '', summary: '',
      experience: [], education: [], skills: [], languages: [],
      certifications: [], projects: [], hobbies: []
    };

    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    await run('INSERT INTO cvs (id, user_id, title, template, theme, font, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.userId, title || 'Moje CV', template || 'modern', theme || 'blue', font || 'Inter',
       JSON.stringify({ ...defaultData, ...data }), now, now]);

    const cv = await get('SELECT * FROM cvs WHERE id = ?', [id]);
    res.status(201).json(cv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const existing = await get('SELECT * FROM cvs WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (!existing) return res.status(404).json({ error: 'CV nie znalezione' });

    const { title, template, theme, font, data, isPublic } = req.body;
    const cvData = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : existing.data;
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    await run('UPDATE cvs SET title = ?, template = ?, theme = ?, font = ?, data = ?, is_public = ?, updated_at = ? WHERE id = ?',
      [title || existing.title, template || existing.template, theme || existing.theme, font || existing.font,
       cvData, isPublic !== undefined ? (isPublic ? 1 : 0) : existing.is_public, now, req.params.id]);

    const cv = await get('SELECT * FROM cvs WHERE id = ?', [req.params.id]);
    res.json(cv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await get('SELECT * FROM cvs WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (!existing) return res.status(404).json({ error: 'CV nie znalezione' });
    await run('DELETE FROM cvs WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ message: 'CV usunięte' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/share', authenticate, async (req, res) => {
  try {
    const existing = await get('SELECT * FROM cvs WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (!existing) return res.status(404).json({ error: 'CV nie znalezione' });

    const shareLink = existing.share_link || uuidv4().replace(/-/g, '').substring(0, 12);
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    await run('UPDATE cvs SET is_public = 1, share_link = ?, updated_at = ? WHERE id = ?', [shareLink, now, req.params.id]);

    res.json({ shareLink });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/shared/:link', async (req, res) => {
  try {
    const cv = await get('SELECT * FROM cvs WHERE share_link = ? AND is_public = 1', [req.params.link]);
    if (!cv) return res.status(404).json({ error: 'CV nie znalezione' });
    res.json(cv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/clone', authenticate, async (req, res) => {
  try {
    const source = await get('SELECT * FROM cvs WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (!source) return res.status(404).json({ error: 'CV nie znalezione' });

    const id = uuidv4();
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    await run('INSERT INTO cvs (id, user_id, title, template, theme, font, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.userId, `${source.title} (kopia)`, source.template, source.theme, source.font, source.data, now, now]);

    const cv = await get('SELECT * FROM cvs WHERE id = ?', [id]);
    res.status(201).json(cv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    const cv = await get('SELECT * FROM cvs WHERE id = ? AND (user_id = ? OR is_public = 1)', [req.params.id, req.userId]);
    if (!cv) return res.status(404).json({ error: 'CV nie znalezione' });
    const data = JSON.parse(cv.data);
    res.json({ id: cv.id, title: cv.title, template: cv.template, theme: cv.theme, font: cv.font, data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/pdf', authenticate, async (req, res) => {
  try {
    const cv = await get('SELECT * FROM cvs WHERE id = ? AND (user_id = ? OR is_public = 1)', [req.params.id, req.userId]);
    if (!cv) return res.status(404).json({ error: 'CV nie znalezione' });

    const data = JSON.parse(cv.data);
    const lang = data.language === 'auto' ? detectLang(data) : (data.language || 'pl');

    const L = {
      pl: { summary: 'PODSUMOWANIE', experience: 'DOŚWIADCZENIE', education: 'EDUKACJA', skills: 'UMIEJĘTNOŚCI', languages: 'JĘZYKI', certs: 'CERTYFIKATY', projects: 'PROJEKTY', interests: 'ZAINTERESOWANIA', present: 'Obecnie' },
      en: { summary: 'PROFESSIONAL SUMMARY', experience: 'EXPERIENCE', education: 'EDUCATION', skills: 'SKILLS', languages: 'LANGUAGES', certs: 'CERTIFICATIONS', projects: 'PROJECTS', interests: 'INTERESTS', present: 'Present' },
    }[lang];

    const MARGIN = 45;
    const PAGE_H = 841.89;
    const PAGE_W = 595.28;
    const MAX_Y = PAGE_H - MARGIN;
    const CONTENT_W = PAGE_W - MARGIN * 2;

    const THEME = {
      blue:   { accent: '#2563eb', light: '#dbeafe' },
      green:  { accent: '#16a34a', light: '#dcfce7' },
      purple: { accent: '#9333ea', light: '#f3e8ff' },
      red:    { accent: '#dc2626', light: '#fee2e2' },
      orange: { accent: '#ea580c', light: '#ffedd5' },
      teal:   { accent: '#0d9488', light: '#ccfbf1' },
      pink:   { accent: '#db2777', light: '#fce7f3' },
      gray:   { accent: '#4b5563', light: '#f3f4f6' },
    };
    const C = THEME[cv.theme] || THEME.blue;

    const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cv-${cv.id}.pdf"`);
    doc.pipe(res);

    const fonts = {
      Inter:   { dir: './fonts', name: 'Inter' },
      Arial:   { dir: '/usr/share/fonts/liberation-sans-fonts', name: 'LiberationSans' },
      Georgia: { dir: '/usr/share/fonts/liberation-serif-fonts', name: 'LiberationSerif' },
      'Times New Roman': { dir: '/usr/share/fonts/liberation-serif-fonts', name: 'LiberationSerif' },
      'Courier New': { dir: '/usr/share/fonts/liberation-mono-fonts', name: 'LiberationMono' },
    };
    const f = fonts[cv.font] || fonts.Inter;
    const mk = (s) => `${f.dir}/${f.name}${s}.ttf`;
    doc.registerFont('Regular', mk('-Regular'));
    doc.registerFont('Bold', mk('-Bold'));
    doc.registerFont('Italic', mk('-Italic'));
    doc.registerFont('BoldItalic', mk('-BoldItalic'));

    function sectionHeader(text) {
      let h = 25;
      if (doc.y + h > MAX_Y) doc.addPage();
      doc.fontSize(8.5).font('Bold').fillColor(C.accent).text(text.toUpperCase());
      doc.moveDown(0.1);
      doc.rect(MARGIN, doc.y, CONTENT_W, 0.5).fill(C.accent);
      doc.moveDown(0.35);
      doc.fillColor('#1e293b');
    }
    function entryTitle(text) {
      if (doc.y + 16 > MAX_Y) doc.addPage();
      doc.fontSize(9).font('Bold').fillColor('#1e293b').text(text || '');
    }

    doc.rect(MARGIN, 30, CONTENT_W, 72).fill('#1e293b');
    doc.fillColor('#ffffff');
    doc.fontSize(20).font('Bold').text(`${data.firstName || ''} ${data.lastName || ''}`, MARGIN, 42, { align: 'center', width: CONTENT_W });
    doc.fontSize(10).font('Regular').fillColor('#cbd5e1').text(data.title || '', MARGIN, 66, { align: 'center', width: CONTENT_W });
    doc.fontSize(8).font('Regular').fillColor('#94a3b8').text(
      [data.email, data.phone, data.location].filter(Boolean).join('  |  '), MARGIN, 84, { align: 'center', width: CONTENT_W }
    );
    doc.y = 115;

    doc.fillColor('#1e293b');

    if (data.summary) {
      sectionHeader(L.summary);
      doc.fontSize(8.5).font('Regular').text(data.summary, { lineGap: 2 });
      doc.moveDown(0.3);
    }

    if (data.experience?.length) {
      sectionHeader(L.experience);
      for (const exp of data.experience) {
        entryTitle(exp.position || '');
        doc.fontSize(8).font('Regular').fillColor('#475569').text(`${exp.company}${exp.location ? `, ${exp.location}` : ''}`);
        doc.fontSize(7).font('Italic').fillColor('#94a3b8').text(`${exp.startDate || ''} - ${exp.endDate || L.present}`);
        if (exp.description) {
          doc.fontSize(8).font('Regular').text(exp.description, { lineGap: 1.5 });
        }
        doc.moveDown(0.2);
      }
      doc.moveDown(0.1);
    }

    if (data.education?.length) {
      sectionHeader(L.education);
      for (const edu of data.education) {
        entryTitle(edu.degree || '');
        doc.fontSize(8).font('Regular').fillColor('#475569').text(edu.institution || '');
        if (edu.startDate || edu.endDate) doc.fontSize(7).font('Italic').fillColor('#94a3b8').text(`${edu.startDate || ''} - ${edu.endDate || ''}`);
        if (edu.description) {
          doc.fontSize(8).font('Regular').text(edu.description, { lineGap: 1.5 });
        }
        doc.moveDown(0.2);
      }
      doc.moveDown(0.1);
    }

    if (data.skills?.length) {
      sectionHeader(L.skills);
      const sorted = [...data.skills].sort((a,b) => (b.level||0) - (a.level||0));
      const lines = [];
      let cur = [];
      for (const s of sorted) {
        const t = `${s.name} ${s.level||5}/10`;
        cur.push(t);
        if (cur.join(' · ').length > 80) {
          lines.push(cur.slice(0,-1).join(' · '));
          cur = [t];
        }
      }
      if (cur.length) lines.push(cur.join(' · '));
      doc.fontSize(7.5).font('Regular').fillColor('#1e293b');
      for (const line of lines) {
        if (doc.y + 12 > MAX_Y) doc.addPage();
        doc.text(line, { lineGap: 2 });
      }
      doc.moveDown(0.2);
    }

    if (data.languages?.length) {
      sectionHeader(L.languages);
      doc.fontSize(8).font('Regular').fillColor('#1e293b');
      for (const l of data.languages) {
        doc.text(`${l.name || l}${l.level ? ` — ${l.level}` : ''}`);
        doc.moveDown(0.05);
      }
      doc.moveDown(0.1);
    }

    if (data.certifications?.length) {
      sectionHeader(L.certs);
      doc.fontSize(8).font('Regular').fillColor('#1e293b');
      for (const cert of data.certifications) {
        doc.text(`${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`);
        doc.moveDown(0.05);
      }
      doc.moveDown(0.1);
    }

    if (data.projects?.length) {
      sectionHeader(L.projects);
      for (const proj of data.projects) {
        entryTitle(proj.name || '');
        if (proj.description) doc.fontSize(8).font('Regular').fillColor('#1e293b').text(proj.description, { lineGap: 1.5 });
        if (proj.url) doc.fontSize(7).font('Italic').fillColor(C.accent).text(proj.url);
        doc.moveDown(0.2);
      }
      doc.moveDown(0.1);
    }

    if (data.hobbies?.length) {
      sectionHeader(L.interests);
      doc.fontSize(8).font('Regular').fillColor('#1e293b').text(data.hobbies.map(h => h.name || h).join(' · '), { lineGap: 1.5 });
      doc.moveDown(0.1);
    }

    doc.end();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
