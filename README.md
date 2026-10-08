# Phokawin Skills

คลัง **Agent Skills** สำหรับ AI coding agents (Claude Code, Cursor, Codex, Antigravity) ตามมาตรฐาน [skills.sh](https://skills.sh)

แนวคิดของคลังนี้: สกิลที่ดีไม่ใช่สกิลที่สอนสิ่งที่โมเดลรู้อยู่แล้ว แต่คือสกิลที่ **บังคับวินัย** — มีจุดหยุดให้คนตัดสินใจ มีเกณฑ์ผ่าน/ไม่ผ่านที่เขียนไว้ล่วงหน้า และห้ามอ้างผลลัพธ์ที่ยังไม่ได้วัด

---

## Quick Start

ติดตั้งลงโปรเจกต์ปัจจุบัน:

```bash
npx skills add Phokawin47/Phokawin-skills --all
```

ติดตั้งแบบ global (ใช้ได้ทุกโปรเจกต์):

```bash
npx skills add Phokawin47/Phokawin-skills -g
```

ดูรายชื่อสกิลก่อนติดตั้ง:

```bash
npx skills add Phokawin47/Phokawin-skills --list
```

ติดตั้งเฉพาะบางตัว:

```bash
npx skills add Phokawin47/Phokawin-skills refactor
```

### ติดตั้งแบบ manual (ไม่ใช้ npx)

```bash
git clone https://github.com/Phokawin47/Phokawin-skills.git
mkdir -p ~/.claude/skills
cp -r Phokawin-skills/skills/*/* ~/.claude/skills/
```

หรือใช้เฉพาะในโปรเจกต์เดียว เปลี่ยนปลายทางเป็น `<project>/.claude/skills/`

ตรวจว่า Claude Code เห็นสกิลแล้ว: เปิด Claude Code แล้วพิมพ์ `/skills`

---

## Catalog

### `skills/engineering/`

- **[`refactor`](skills/engineering/refactor/SKILL.md)** — ปรับโครงสร้างโค้ดโดยไม่เปลี่ยนพฤติกรรม จุดเด่นคือ **Gate 0**: ต้องหา test/type/lint command ของโปรเจกต์จริง เช็กว่าโค้ดเป้าหมายมีเทสต์คุมจริงไหม และรัน baseline เก็บผลก่อนแตะโค้ด ถ้าไม่มีเทสต์หรือ baseline แดง → หยุดและเสนอทางเลือก มีเพดานขอบเขต 5 ไฟล์ / 400 บรรทัดต่อรอบ, commit ทีละ refactoring, ห้าม `git add -A`, และเทสต์แดงหลังแก้ = revert ไม่ใช่แก้จนเขียว
- **[`git-commit`](skills/engineering/git-commit/SKILL.md)** — วิเคราะห์ diff จริง stage ทีละ path และเขียนข้อความ Conventional Commit มีคำสั่ง commit สำหรับ PowerShell และ hook (`hooks/guard.js`) ที่บล็อก `git add -A` / `git add .` / `git commit -a`
- **[`spec-to-tasks`](skills/engineering/spec-to-tasks/SKILL.md)** — สรุปบทสนทนาเป็น Technical Spec แล้วแตกเป็น checklist งานแบบ tracer-bullet พร้อมลำดับก่อนหลัง (user เรียกเอง)
- **[`post-mortem`](skills/engineering/post-mortem/SKILL.md)** — บันทึก root cause, กลไกของบั๊ก, การยืนยัน และการป้องกัน ลง `docs/post-mortems/<date>-<slug>.md`
- **[`karpathy-guidelines`](skills/engineering/karpathy-guidelines/SKILL.md)** — Think before coding, Simplicity first, Surgical changes, Goal-driven execution
- **[`scrutinize`](skills/engineering/scrutinize/SKILL.md)** — รีวิว plan / PR / diff จากมุมมองคนนอก ตั้งคำถามว่ามีวิธีง่ายกว่านี้ไหม และไล่ code path จริงไม่ใช่ดูแค่ diff
- **[`debug-mantra`](skills/engineering/debug-mantra/SKILL.md)** — สกิลดีบักตัวเดียวครบวงจร (รวม `systematic-debugger` และ `code-bug-hunter` เดิม): reproduce → หา fail path → หักล้างสมมติฐาน 3–5 ข้อ → ledger ทุกการทดลอง → แก้ที่ root cause ที่พิสูจน์แล้ว → ยืนยันด้วย regression test มี checklist ที่ย้อนกลับได้ และ [`references/stack-pitfalls.md`](skills/engineering/debug-mantra/references/stack-pitfalls.md) สำหรับ Python/data/ML, web/backend, LaTeX, Windows/PowerShell

### `skills/productivity/`

- **[`caveman`](skills/productivity/caveman/SKILL.md)** — โหมดตอบสั้นขั้นสุด ตัดคำฟุ่มเฟือยแต่คงความถูกต้องทางเทคนิค ประหยัด token
- **[`find-skills`](skills/productivity/find-skills/SKILL.md)** — ค้นหาและติดตั้งสกิลจาก [skills.sh](https://skills.sh)
- **[`grill-me`](skills/productivity/grill-me/SKILL.md)** — สัมภาษณ์เค้นความคิดแบบ Socratic (รวม `grill-with-docs` เดิม) โหมดปกติจบในแชต ไม่สร้างไฟล์; `/grill-me docs` เพิ่มการบันทึก `CONTEXT.md` และ `docs/adr/` (user เรียกเอง)
- **[`handoff`](skills/productivity/handoff/SKILL.md)** — สรุปสถานะงานลง OS temp directory เพื่อส่งต่อให้เซสชันถัดไป ตัด secrets ทิ้ง (user เรียกเอง)

### ข้อตกลงร่วมของทุกสกิล

- **ภาษารายงาน:** ทุกสกิล (ยกเว้น `caveman`) ถามครั้งแรกของเซสชันว่าจะให้รายงานเป็นภาษาไทยหรือ English (ถ้าตอบไม่ชัด = ไทย) แล้วไม่ถามซ้ำ โค้ด, identifier, คำสั่ง และ commit message คงภาษาเดิม อยากข้ามการถาม ให้ใส่บรรทัดภาษาที่ต้องการไว้ใน `~/.claude/CLAUDE.md`
- **Trigger ภาษาไทย:** `description` ของสกิลที่โมเดลเรียกเองได้มีวลีภาษาไทยกำกับ (เช่น "บั๊ก", "พัง", "รีวิวให้หน่อย")
- **Hooks:** `git-commit` และ `refactor` มี PreToolUse hook (Node) ฝังใน frontmatter เพื่อบังคับกฎ "stage ทีละ path" ต้องมี `node` ใน PATH
- **เครื่องมือที่ต้องติดตั้งเอง:** เครื่องมือตรวจ (`pytest`, `ruff`, `latexmk`, `pdftotext`, `Pester`) ไม่ถูกติดตั้งให้ สกิลจะตรวจว่ามีไหมแล้วแจ้ง

ที่มาและการแก้ไข: สกิลทั้งหมดยกเว้น `refactor` มาจาก [Rachapol03/Rachapol-skills](https://github.com/Rachapol03/Rachapol-skills) และโปรเจกต์ต้นทางอื่น แล้วถูกปรับ/รวมใหม่ในคลังนี้ (เพิ่ม Thai triggers, report language, checklist) ดูแหล่งต้นทางและ copyright ได้ที่ [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

---

## เพิ่มสกิลใหม่

1. สร้างโฟลเดอร์ `skills/<category>/<skill-name>/SKILL.md`
2. ใส่ YAML frontmatter — `description` คือกลไกเดียวที่ทำให้ agent เรียกสกิลถูกจังหวะ เขียนให้ครอบคลุมทั้ง "ทำอะไร" และ "เมื่อไหร่ควรใช้" รวมถึงสำนวนที่ผู้ใช้พูดจริงโดยไม่เอ่ยชื่อสกิล

```yaml
---
name: your-skill-name
description: สรุปว่าทำอะไร + เมื่อไหร่ควร trigger ใส่คีย์เวิร์ดสำคัญไว้ต้นประโยค
disable-model-invocation: true   # ใส่เฉพาะสกิลที่ต้องการให้ user เรียกเองเท่านั้น
---
```

   เขียน `description` เป็นบุรุษที่สาม ("Reviews…", "Creates…") ไม่ใช่ "I can help…" และกำหนดระดับอิสระ (freedom level) ของสกิลไว้ในเนื้อหา
3. SKILL.md ไม่เกิน 500 บรรทัด แยกรายละเอียดเป็น `references/` ลึกไม่เกิน 1 ชั้น ไฟล์เกิน 100 บรรทัดใส่สารบัญ งานหลายขั้นใช้ checklist พร้อมจุดย้อนกลับ กฎที่พลาดไม่ได้ย้ายไปเป็น hook
4. ทดสอบว่าถูกตรวจเจอ: `npx skills add ./ --list`
5. ทดสอบ trigger จริง — สั่งงานด้วยประโยคแบบคนใช้จริง (ไม่เอ่ยชื่อสกิล) แล้วดูว่า agent หยิบสกิลขึ้นมาไหม ถ้าไม่หยิบ แปลว่า `description` ยังไม่พอ ไม่ใช่เนื้อหาในสกิลผิด
6. commit ทีละไฟล์ แล้วเปิด PR

---

## License

MIT — ดู [LICENSE](LICENSE) และ [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) สำหรับสกิลจากแหล่งอื่น
