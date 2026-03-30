# 🌽 CornMCP Setup Project Plan

**Task:** Install and integrate Corn Hub for code intelligence and analytics.

## Overview
Cài đặt Corn Hub để tối ưu hóa context cho Agent (Antigravity), giúp tiết kiệm Token và phân tích AST (Abstract Syntax Tree) trực tiếp cho project `web_ban_do_dien_tu`.

## Project Type
**BACKEND / TOOLING**

## Success Criteria
- [ ] Clone và build thành công Corn Hub.
- [ ] 3 dịch vụ: API (:4000), MCP (:8317), Dashboard (:3000) chạy ổn định.
- [ ] Antigravity nhận diện được 18 công cụ của Corn MCP.
- [ ] Index thành công project `web_ban_do_dien_tu`.

## Tech Stack
- **Node.js 22.x**
- **pnpm 10.x**
- **SQLite** (Local Persistence)
- **TypeScript Compiler API** (AST Engine)

## File Structure
Dự án sẽ được cài đặt tại thư mục anh em (sibling):
`../corn-hub/` (c:\Users\ACER\Next-JS-Project\corn-hub)

## Task Breakdown

### Phase 1: Environment & Source
| Task ID | Name | Agent | Skills | Status |
|---------|------|-------|--------|--------|
| T1.1 | Clone Repository | `devops-engineer` | clean-code | [ ] |
| T1.2 | pnpm install & build | `devops-engineer` | clean-code | [ ] |

**INPUT → OUTPUT → VERIFY:**
- IN: URL github.com/yuki-20/corn-hub.git
- OUT: Thư mục `corn-hub` với đủ `node_modules` và `dist/`
- VERIFY: `ls ../corn-hub/apps/corn-mcp/dist/cli.js` tồn tại.

### Phase 2: Start Services
| Task ID | Name | Agent | Skills | Status |
|---------|------|-------|--------|--------|
| T2.1 | Start corn-api | `backend-specialist` | nodejs-best-practices | [ ] |
| T2.2 | Start corn-mcp | `backend-specialist` | api-patterns | [ ] |
| T2.3 | Start corn-web | `frontend-specialist` | next-js-react-expert | [ ] |

**INPUT → OUTPUT → VERIFY:**
- IN: `tsx src/index.ts`
- OUT: Console log "Server running on port XXXX"
- VERIFY: `curl http://localhost:4000/health` trả về HTTP 200.

### Phase 3: Integration
| Task ID | Name | Agent | Skills | Status |
|---------|------|-------|--------|--------|
| T3.1 | Config Antigravity | `orchestrator` | clean-code | [ ] |
| T3.2 | Index Codebase | `orchestrator` | architecture | [ ] |

**INPUT → OUTPUT → VERIFY:**
- IN: Path tới `cli.js`
- OUT: Symbol list xuất hiện trong Dashboard.
- VERIFY: Chạy thử tool `corn_health` trong Antigravity.

## Phase X: Verification
- [ ] `pnpm build` không có lỗi.
- [ ] API Health check Pass.
- [ ] Antigravity MCP list hiển thị `corn`.
- [ ] Dashboard hiển thị ít nhất 1 project được index.
