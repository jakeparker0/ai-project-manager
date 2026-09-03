**OCI Instance Setup**
1. Create VM.Standard.A1.Flex instance -- 4 OCPUs, 24GB RAM, Ubuntu 22.04
2. Generate and download SSH keypair during creation
3. Open ports 22, 80, 443 in OCI Security List -- block everything else including 8000
4. SSH in and run system updates -- `apt update && apt upgrade`
5. Install Python 3.10+, pip, venv, nginx, certbot, python3-certbot-nginx

**DuckDNS + SSL**

6. Create account at duckdns.org, register a subdomain, point it at your OCI public IP
7. Set up DuckDNS auto-renewal script as a cron job so the IP stays current if OCI changes it
8. Run Certbot -- `certbot --nginx -d yourname.duckdns.org`

**Application Setup**

9. Clone repo onto the instance
10. Create venv, pip install requirements
11. Create `.env` with `ANTHROPIC_API_KEY`
12. Build the React frontend -- `npm install && npm run build`
13. Test FastAPI starts manually -- `uvicorn main:app --host 127.0.0.1 --port 8000`

**nginx Config**

14. Configure nginx to reverse proxy `/api` to uvicorn on port 8000
15. Configure nginx to serve the React static build for everything else
16. Add HTTP Basic Auth to nginx -- `htpasswd` to generate credentials
17. Test the full stack through nginx before setting up systemd

**systemd Service**

18. Write a systemd unit file for uvicorn
19. Enable and start the service -- `systemctl enable pm-agent && systemctl start pm-agent`
20. Verify it restarts automatically -- `systemctl restart pm-agent`, check logs

**MCP Server Refactor**

21. Add `PM_AGENT_API_URL` environment variable to `mcp_server.py`
22. Refactor each MCP tool to call the REST API over HTTP instead of importing `database.py`
23. Update Claude Desktop config to pass the env variable pointing at the DuckDNS URL
24. Test `get_context` against the deployed instance from Claude Desktop

**Deployment Automation**

25. Write a `deploy.sh` script on the instance -- git pull, pip install, npm build, systemctl restart
26. Make it executable, test it manually
27. Add a GitHub Actions workflow that SSHes into the instance and runs `deploy.sh` on push to main
28. Store OCI SSH key and DuckDNS URL as GitHub Actions secrets
29. Test the full pipeline -- push a change, verify it deploys automatically and the service restarts cleanly