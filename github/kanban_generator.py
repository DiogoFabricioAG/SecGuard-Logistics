import json
from github import Github, GithubException
import os 
TOKEN = os.getenv("GHP_KEY")
OWNER = "DiogoFabricioAG"
REPO = "SecGuard-Logistics"

with open("github/secguard-issues-detailed.json", encoding="utf-8") as f:
    data = json.load(f)

g = Github(TOKEN)
repo = g.get_repo(f"{OWNER}/{REPO}")

labels_config = [
    {"name": "uml", "color": "0e8a16", "desc": "Diagramas UML"},
    {"name": "bpmn", "color": "1f883f", "desc": "Diagramas BPMN"},
    {"name": "reqs", "color": "d73a4a", "desc": "Requerimientos"},
    {"name": "docs", "color": "0075ca", "desc": "Documentacion"},
    {"name": "priority-high", "color": "d73a4a", "desc": "Alta prioridad"},
    {"name": "priority-medium", "color": "f85149", "desc": "Media prioridad"},
    {"name": "alpr", "color": "0366d6", "desc": "ALPR"},
    {"name": "aws-infra", "color": "dbab09", "desc": "AWS"},
    {"name": "seguridad", "color": "cfcfcf", "desc": "Seguridad"},
    {"name": "sprint1", "color": "28a745", "desc": "Sprint 1"},
    {"name": "review-needed", "color": "dbab09", "desc": "Revision"},
    {"name": "epic", "color": "3f51b5", "desc": "Epic"},
    {"name": "casos-uso", "color": "a2eeef", "desc": "Casos uso"}
]

print("Creating labels...")
for lbl in labels_config:
    try:
        repo.create_label(name=lbl["name"], color=lbl["color"], description=lbl["desc"])
        print(f"✅ {lbl['name']}")
    except:
        print(f"⚠️  {lbl['name']}")

print("\nCreating issues...")
for issue_data in data["issues"]:
    try:
        issue = repo.create_issue(
            title=issue_data["title"],
            body=issue_data["body"],
            labels=issue_data["labels"]
        )
        print(f"✅ #{issue.number}: {issue_data['title'][:45]}")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n🎉 Done!")