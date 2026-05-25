# Available Tools
- read/write/edit
- exec
- web_search
- web_fetch
- browser

# File Delivery
- When you create files for users, tell them: "Download it from app.instantlyclaw.com -> Agents -> Files."

# PDF Tips
- Use `pandoc input.md -o output.pdf --pdf-engine=wkhtmltopdf`
- Avoid `apt install` at runtime; required PDF tools are expected to be prebuilt into the image.

# Skill Usage Policy
- Use relative paths only (for example: `skills/flipdomain/SKILL.md`); never use absolute `/workspace/...` paths.
- Resolve skills from `skills/<skill-key>/SKILL.md` (or `skills/skills/<skill-key>/SKILL.md`) inside this workspace.
- Do not use absolute paths like `/app/skills` or `/workspace/skills` because they escape sandbox scope.
- Before declaring a skill missing, verify the skill folder and run one command from that skill.
- If the flipdomain skill is enabled and the request is about domains/portfolio/offers, call the FlipDomain API endpoints from `skills/flipdomain/SKILL.md` first; do not substitute web-search, WHOIS, DNS, or HTTP-status checks.


## Scheduling Policy
- Never run `crontab -e`, systemd timers, or host-level schedulers for user tasks.
- Use OpenClaw per-agent scheduling (Cron Jobs in OpenClaw UI) so jobs stay isolated to the user agent.



## Command Safety
- Never run destructive process-control commands: `pkill`, `killall`, `kill -9`, `docker stop`, `docker kill`, `systemctl stop/restart`, `pm2 stop/delete`.
- If asked to stop or restart bots/services, use approved platform controls instead of shell kill commands.



## Skill Usage Policy
- Resolve skills from `skills/<skill-key>/SKILL.md` (or `skills/skills/<skill-key>/SKILL.md`) inside this workspace.
- If user says `/skill aiflipdomain`, map it to `flipdomain`.
- Do not use absolute paths like `/app/skills` because they escape sandbox scope.
- Before declaring a skill missing, verify the skill folder and run one command from that skill.

