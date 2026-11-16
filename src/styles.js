/* 8号 h6 · 母版样式（继承 h5，逐字节保留原规则，仅追加法务页/署名块） */
export const CSS = `
:root{--bg:#0b1020;--panel:#121a2e;--panel2:#0f1730;--line:#233150;--text:#e8edf7;--muted:#8b9ab8;--green:#3ddc97;--gray:#6b7a99;--red:#ff6b6b;--accent:#7aa2ff;--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;--sans:system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%}
body{background:var(--bg);color:var(--text);font-family:var(--sans);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}
.ipck-shell{display:grid;grid-template-columns:220px minmax(0,1fr);min-height:100vh}
.ipck-side{border-right:1px solid var(--line);padding:22px 16px;display:flex;flex-direction:column;gap:6px;background:#0a0f1e}
.ipck-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:16px;letter-spacing:.02em}
.ipck-logo{width:26px;height:26px;border:1px solid var(--accent);border-radius:7px;display:grid;place-items:center;color:var(--accent);font-family:var(--mono);font-size:12px}
.ipck-tag{color:var(--muted);font-size:11px;margin:0 0 18px 36px}
.ipck-nav{display:flex;flex-direction:column;gap:2px}
.ipck-nav a,.ipck-nav span{display:block;padding:9px 12px;border-radius:8px;color:var(--muted);text-decoration:none;font-size:13px;border:1px solid transparent}
.ipck-nav a:hover{color:var(--text);background:var(--panel)}
.ipck-nav a.is-active{color:var(--text);background:var(--panel);border-color:var(--line)}
.ipck-nav span{opacity:.45;cursor:default}
.ipck-side-foot{margin-top:auto;color:var(--muted);font-size:11px;font-family:var(--mono);padding-top:18px}
.ipck-main{display:flex;flex-direction:column;min-width:0}
.ipck-top{border-bottom:1px solid var(--line);padding:20px 28px 16px}
.ipck-top-row{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
.ipck-top h1{margin:0;font-size:20px;font-weight:650;letter-spacing:.01em}
.ipck-top p{margin:4px 0 0;color:var(--muted);font-size:12px}
.ipck-actions{display:flex;gap:10px;align-items:center;flex-shrink:0}
.ipck-btn{background:#1b2a4a;color:var(--text);border:1px solid #31456e;border-radius:8px;padding:9px 16px;font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.ipck-btn:hover{background:#23375f}
.ipck-btn:disabled{opacity:.6;cursor:default}
.ipck-lang{color:var(--muted);text-decoration:none;font-size:12px;border:1px solid var(--line);padding:8px 12px;border-radius:8px;white-space:nowrap}
.ipck-lang:hover{color:var(--text)}
.ipck-diag{padding:10px 28px;border-bottom:1px solid var(--line);font-size:12px;font-family:var(--mono);color:var(--muted);background:#0d1426;min-height:38px;line-height:1.5}
.ipck-diag-ok{color:var(--green)}.ipck-diag-bad{color:var(--red)}.ipck-diag-warn{color:#e8c66a}
.ipck-progress{margin-top:14px;height:4px;background:#18233d;border-radius:999px;overflow:hidden}
.ipck-progress-fill{height:100%;width:35%;background:var(--accent);border-radius:999px;animation:ipck-slide 1.2s ease-in-out infinite}
@keyframes ipck-slide{0%{margin-left:-35%}100%{margin-left:100%}}
.ipck-content{padding:24px 28px;display:flex;flex-direction:column;gap:18px;flex:1}
.ipck-panel{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:18px;min-width:0}
.ipck-panel h2{margin:0 0 14px;font-size:12px;font-weight:600;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
.ipck-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.ipck-big{font-family:var(--mono);font-size:30px;letter-spacing:.02em;margin-bottom:16px;word-break:break-all}
.ipck-summary-ip{display:flex;align-items:baseline;gap:12px;margin-bottom:14px}
.ipck-summary-ip span{color:var(--muted);font-size:12px}
.ipck-summary-ip b{font-family:var(--mono);font-size:22px;font-weight:600;word-break:break-all}
.ipck-grid-fields{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.ipck-field{border:1px solid var(--line);border-radius:9px;padding:10px 12px;background:var(--panel2);min-width:0}
.ipck-field span{display:block;color:var(--muted);font-size:11px;margin-bottom:4px}
.ipck-field b{font-family:var(--mono);font-size:13px;font-weight:600;word-break:break-all}
.ipck-precision{color:var(--muted);font-size:11px;margin:14px 0 0}
.ipck-table{width:100%;border-collapse:collapse;font-size:12px}
.ipck-table th{text-align:left;color:var(--muted);font-weight:500;padding:9px 10px;border-bottom:1px solid var(--line)}
.ipck-table td{padding:10px;border-bottom:1px solid #1b2742;font-family:var(--mono);word-break:break-all}
.ipck-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:7px;vertical-align:middle}
.ipck-dot.g{background:var(--green)}.ipck-dot.n{background:var(--gray)}.ipck-dot.r{background:var(--red)}
.ipck-empty{color:var(--muted);font-size:12px;padding:14px 0}
.ipck-notice{border-left:2px solid var(--accent);padding:6px 0 6px 14px}
.ipck-notice b{font-size:13px}.ipck-notice p{color:var(--muted);font-size:12px;margin:6px 0 0}
.ipck-method{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:20px}
.ipck-method h2{margin:0 0 12px;font-size:15px}
.ipck-method ol{margin:0;padding-left:20px;color:var(--muted);font-size:12px}
.ipck-method li{margin-bottom:8px}
.ipck-sourcebar{border-top:1px solid var(--line);padding:14px 28px;color:var(--muted);font-size:11px;font-family:var(--mono);background:#0a0f1e}
/* [v32] 源条字段行 / 译名注明已移除，不再需要这两条样式 */

.ipck-cross{margin-top:14px;border:1px solid var(--line);border-radius:9px;padding:11px 13px;background:var(--panel2);font-size:12px}
.ipck-cross.ok{border-color:#1f6b4d}.ipck-cross.warn{border-color:#8a6a22}
.ipck-cross b{font-weight:600}.ipck-cross p{color:var(--muted);font-size:11px;margin:6px 0 0}
.ipck-cross table{margin-top:10px}
.ipck-attr{margin-top:12px;font-size:11px;color:var(--muted)}
.ipck-attr a,.ipck-sb-attr a{color:var(--accent);text-decoration:none}
.ipck-sb-attr{margin-top:6px}
.ipck-privacy{max-width:860px}
.ipck-privacy h2{margin:0 0 16px;font-size:15px}
.ipck-privacy p{color:var(--muted);font-size:13px;line-height:1.85;margin:0 0 12px}
.ipck-privacy .ipck-lang{display:inline-block;margin-top:8px}
@media (max-width:860px){

  .ipck-shell{grid-template-columns:1fr}
  .ipck-side{border-right:0;border-bottom:1px solid var(--line);padding:12px 16px;flex-direction:row;align-items:center;gap:10px;overflow-x:auto}
  .ipck-tag,.ipck-side-foot{display:none}
  .ipck-nav{flex-direction:row;gap:4px}
  .ipck-nav a,.ipck-nav span{padding:7px 10px;white-space:nowrap}
  .ipck-brand{margin:0}
  .ipck-top{padding:16px}
  .ipck-diag{padding:10px 16px}
  .ipck-top-row{flex-direction:row;align-items:flex-start}
  .ipck-actions{display:none}
  .ipck-content{padding:16px;gap:14px}
  .ipck-cols{grid-template-columns:1fr}
  .ipck-grid-fields{grid-template-columns:repeat(2,1fr)}
  .ipck-sourcebar{padding:12px 16px}
  .ipck-sb-row{display:block;padding:6px 0}
}

/* h6 · 法务页、常驻署名块、同意回执 */
.ipck-legal{max-width:880px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:24px 26px}
.ipck-legal h2{margin:0 0 18px;font-size:16px;font-weight:650}
.ipck-legal p{color:var(--muted);font-size:13px;line-height:1.9;margin:0 0 14px}
.ipck-legal a{color:var(--accent);text-decoration:none}
.ipck-legal a:hover{text-decoration:underline}
.ipck-legal-meta{font-size:11px!important;font-family:var(--mono);opacity:.75;border-top:1px solid var(--line);padding-top:12px}
.ipck-legal-links{font-size:12px!important}
.ipck-legal .ipck-lang{display:inline-block;margin-top:6px}
.ipck-attr-block{border-top:1px dashed var(--line);margin-top:10px;padding-top:10px;line-height:1.8}
.ipck-attr-block b{color:var(--text);font-weight:600;font-family:var(--sans)}
.ipck-attr-block a{color:var(--accent);text-decoration:none}
.ipck-attr-block a:hover{text-decoration:underline}
.ipck-attr-block .ipck-attr-note{display:block;opacity:.72;margin-top:4px}
.ipck-attr-version{color:var(--green)}
.ipck-attr-version.off{color:#e8c66a}
@media (max-width:860px){
  .ipck-legal{padding:18px 16px}
  .ipck-nav a,.ipck-nav span{padding:6px 9px}
}
/* h8 · 长 IPv6 / 中文译名的窄屏排版：标签不竖断、数值整行可读 */
.ipck-summary-ip{flex-wrap:wrap}
.ipck-summary-ip span{white-space:nowrap;flex:0 0 auto}
.ipck-summary-ip b{min-width:0;overflow-wrap:anywhere;line-height:1.35}
.ipck-field b{overflow-wrap:anywhere;line-height:1.45}
@media(max-width:860px){.ipck-summary-ip b{font-size:18px}.ipck-grid-fields{gap:8px}}
/* h9 · 任意 IP 输入区：与母版同色系，桌面一行、窄屏纵向堆叠 */
.ipck-lookup{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:16px 28px 0}
.ipck-lookup-head h2{margin:0 0 6px;font-size:12px;font-weight:600;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
.ipck-lookup-head p{margin:0 0 12px;color:var(--muted);font-size:12px;line-height:1.6}
.ipck-lookup-row{display:flex;gap:10px;align-items:stretch}
.ipck-lookup-row input{flex:1 1 auto;min-width:0;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:10px 13px;font-family:var(--mono);font-size:13px;outline:none}
.ipck-lookup-row input:focus{border-color:var(--accent)}
.ipck-lookup-row input::placeholder{color:var(--gray);font-family:var(--sans);font-size:12px}
.ipck-lookup-row .ipck-btn{flex:0 0 auto}
.ipck-btn.ghost{background:transparent;border-color:var(--line);color:var(--muted)}
.ipck-btn.ghost:hover{color:var(--text);background:var(--panel2)}
.ipck-subject{margin:0 0 12px;padding:7px 11px;border-radius:7px;border:1px solid var(--line);background:var(--panel2);color:var(--muted);font-family:var(--mono);font-size:11px;line-height:1.5}
.ipck-subject.manual{border-color:#31456e;color:var(--text)}
.ipck-scope{color:var(--muted);font-size:11px;line-height:1.55;margin:8px 0 0}
@media(max-width:860px){.ipck-lookup{margin:14px 16px 0;padding:14px}.ipck-lookup-row{flex-wrap:wrap}.ipck-lookup-row input{flex:1 1 100%}.ipck-lookup-row .ipck-btn{flex:1 1 calc(50% - 5px)}}

/* v25 · 泄露判定结果卡片与第 6 列 */
.ipck-verdict{margin-top:16px;border-radius:12px;padding:16px 18px;border:1px solid var(--line);background:var(--panel2)}
.ipck-verdict h3{margin:0;font-size:16px;font-weight:650;letter-spacing:.01em}
.ipck-verdict p{margin:8px 0 0;font-size:12px;line-height:1.7;color:var(--muted)}
.ipck-verdict.ok{border-color:#1f6b4d;background:#0f2a22}
.ipck-verdict.ok h3{color:var(--green)}
.ipck-verdict.leak{border-color:#8a3030;background:#2a1418}
.ipck-verdict.leak h3{color:var(--red)}
.ipck-verdict.gray{border-color:var(--line);background:var(--panel2)}
.ipck-verdict.gray h3{color:var(--muted)}
.ipck-verdict-note{font-size:11px!important;opacity:.92;margin-top:10px!important;padding-top:10px;border-top:1px solid rgba(255,255,255,.08)}
.ipck-verdict-sup{font-size:11px!important;opacity:.82;margin-top:8px!important;line-height:1.7;color:var(--muted)}
.ipck-verdict-exit{font-family:var(--mono);font-size:11px!important;word-break:break-all}
.ipck-disclaimer{color:var(--muted);font-size:11px;line-height:1.7;margin:16px 0 0;padding-top:12px;border-top:1px solid var(--line)}
.ipck-table-wrap{overflow-x:auto}
/* v28 · 6 列在窄屏横向滑动，长地址与中文标注不逐字拆行 */
.ipck-table-wrap .ipck-table{min-width:720px}
.ipck-table td{white-space:nowrap;word-break:normal;overflow-wrap:normal}
.ipck-table th{white-space:nowrap}
.ipck-table th:nth-child(6),.ipck-table td:nth-child(6){font-family:var(--sans);font-size:11px;white-space:nowrap}

/* v29 · PC + 手机响应式检测操作区 */
.ipck-top{position:relative}
.ipck-head-text{padding-right:118px;min-width:0}
.ipck-lang-switch{position:absolute;top:20px;right:28px;z-index:6;background:var(--panel2)}
.ipck-runbar{max-width:1040px;width:100%;margin:0 auto;padding:20px 28px 4px}
.ipck-run-main{display:block;width:100%;padding:15px 18px;font-size:16px;font-weight:700;letter-spacing:.02em;background:var(--green);color:#071a12;border:1px solid var(--green);border-radius:10px;box-shadow:0 6px 18px rgba(61,220,151,.18);text-align:center;white-space:normal}
.ipck-run-main:hover{background:#5ce8ac;border-color:#5ce8ac}
.ipck-run-main:disabled{opacity:.72;cursor:default;box-shadow:none}
.ipck-run-note{margin:10px 2px 0;color:var(--muted);font-size:12px;line-height:1.75;white-space:normal;overflow-wrap:anywhere;word-break:break-word}
.ipck-result-title{text-transform:none!important;letter-spacing:0!important;font-size:15px!important;color:var(--text)!important}
@media(max-width:860px){
  .ipck-lang-switch{top:14px;right:16px}
  .ipck-head-text{padding-right:96px}
  .ipck-runbar{padding:0 0 10px;max-width:none}
  .ipck-run-main{width:100%;padding:16px 12px;border-radius:0;border-left:0;border-right:0;font-size:17px;box-shadow:none}
  .ipck-run-note{padding:0 16px;margin-top:10px}
  .ipck-result-title{font-size:14px!important}
}

/* 结果区通用样式 · Loading / 错误框 / 公网内网徽标 / 提示 */
.ipck-loading{display:flex;align-items:center;gap:10px;color:var(--accent);font-size:12px;padding:10px 0}
.ipck-loading[hidden]{display:none}
.ipck-spinner{width:16px;height:16px;border:2px solid #233150;border-top-color:var(--green);border-radius:50%;display:inline-block;animation:ipck-spin .8s linear infinite;flex:0 0 auto}
@keyframes ipck-spin{to{transform:rotate(360deg)}}
.ipck-loading-box{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:12px;padding:14px 0}
.ipck-error-box{margin:12px 0;padding:11px 14px;border:1px solid #8a3030;background:#2a1418;border-radius:9px;color:#ffb3b3;font-size:12px;line-height:1.7;overflow-wrap:anywhere}
.ipck-error-box[hidden]{display:none}
.ipck-error-box b{color:var(--red)}
.ipck-error-box p{margin:6px 0 0;color:#e6b3b3}
.ipck-hint{margin-top:14px;border-radius:9px;padding:11px 13px;border:1px solid var(--line);background:var(--panel2);font-size:12px;line-height:1.7}
.ipck-hint.warn{border-color:#8a6a22;background:#2a2312}
.ipck-hint b{color:#e8c66a;font-weight:600}
.ipck-hint p{margin:6px 0 0;color:var(--muted);font-size:11px}
.ipck-sub-title{margin:18px 0 10px;font-size:13px;font-weight:650;color:var(--text);text-transform:none;letter-spacing:0}
.ipck-net-legend{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:var(--panel2)}
.ipck-net-legend b{font-size:12px;color:var(--muted);margin-right:4px;font-weight:600}
.ipck-legend-line{font-size:11px;color:var(--muted);font-family:var(--mono);margin-left:auto}
.ipck-badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;line-height:1.7;white-space:nowrap;font-family:var(--sans);border:1px solid transparent}
.ipck-badge.pub{color:var(--green);border-color:#1f6b4d;background:#0f2a22}
.ipck-badge.priv{color:#e8c66a;border-color:#8a6a22;background:#2a2312}
.ipck-badge.other{color:var(--muted);border-color:var(--line);background:var(--panel2)}
.ipck-tag{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px}
.ipck-tag.ok{color:var(--green);background:#0f2a22;border:1px solid #1f6b4d}
.ipck-tag.bad{color:#ffb3b3;background:#2a1418;border:1px solid #8a3030}
.ipck-risk-note{margin:0 0 14px;padding:10px 13px;border:1px solid #8a6a22;background:#2a2312;border-radius:9px;color:#e8c66a;font-size:12px;line-height:1.8;overflow-wrap:anywhere}
@media(max-width:860px){
  .ipck-legend-line{margin-left:0;flex:1 1 100%}
  .ipck-risk-note,.ipck-hint{font-size:12px}
}

/* 结果卡片与字段网格（WebRTC 判定共用） */
.ipck-verdict{margin:0 0 14px;border-radius:12px;padding:16px 18px;border:1px solid var(--line);background:var(--panel2)}
.ipck-verdict h3{margin:0;font-size:16px;font-weight:650;letter-spacing:.01em}
.ipck-verdict p{margin:8px 0 0;font-size:12px;line-height:1.7;color:var(--muted)}
.ipck-verdict.ok{border-color:#1f6b4d;background:#0f2a22}
.ipck-verdict.ok h3{color:var(--green)}
.ipck-verdict.leak{border-color:#8a3030;background:#2a1418}
.ipck-verdict.leak h3{color:var(--red)}
.ipck-verdict.gray{border-color:var(--line);background:var(--panel2)}
.ipck-verdict.gray h3{color:var(--muted)}
.ipck-verdict-exit{font-family:var(--mono);font-size:11px!important;word-break:break-all}
.ipck-grid-fields{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 4px}
.ipck-field{border:1px solid var(--line);border-radius:9px;padding:10px 12px;background:var(--panel2);min-width:0}
.ipck-field span{display:block;color:var(--muted);font-size:11px;margin-bottom:4px}
.ipck-field b{font-family:var(--mono);font-size:13px;font-weight:600;overflow-wrap:anywhere;line-height:1.45}
.ipck-sub-title{margin:18px 0 10px;font-size:13px;font-weight:650;color:var(--text)}
.ipck-hint.warn{border-color:#8a6a22;background:#2a2312}
.ipck-hint.warn b{color:#e8c66a}
@media(max-width:860px){
  .ipck-grid-fields{grid-template-columns:repeat(2,1fr);gap:8px}
  .ipck-field b{font-size:12px}
}
/* ==========================================================================
   [v32 本轮变更] 手机端收口（放在文件末尾，覆盖前面同特异性规则）
   1) 顶部品牌一行横排，标语不再被挤成竖排；
   2) 主按钮左右留缝 + 四角圆角，与 PC 视觉一致；
   3) 表格滚动条常显 + 常驻滑动文字提示，不滑动也看得出能横向查看；
   4) 站点版本号低调常驻，方便一眼确认部署是否生效。
   ========================================================================== */
.ipck-build{font-family:var(--mono);font-size:11px;color:var(--muted);opacity:.85;white-space:nowrap}
.ipck-swipe-hint{margin:8px 0 0;text-align:center;color:var(--muted);font-size:11px;line-height:1.6;letter-spacing:.02em}
/* 滚动条常驻：不再只在手指滑动时才浮现 */
.ipck-table-wrap{overflow-x:auto;scrollbar-width:thin;scrollbar-color:#3ddc97 #16203a;padding-bottom:10px}
.ipck-table-wrap::-webkit-scrollbar{height:10px;display:block;-webkit-appearance:none}
.ipck-table-wrap::-webkit-scrollbar-track{background:#16203a;border-radius:6px}
.ipck-table-wrap::-webkit-scrollbar-thumb{background:#3ddc97;border-radius:6px;min-width:48px;border:2px solid #16203a}
@media(max-width:860px){
  .ipck-side{padding:10px 96px 10px 14px;gap:8px;flex-wrap:nowrap;min-height:46px}
  .ipck-brand{white-space:nowrap;flex:0 0 auto;font-size:15px}
  .ipck-side > .ipck-tag,.ipck-side-foot{display:none!important}
  .ipck-nav{flex-direction:row;gap:4px;flex:1 1 auto;min-width:0;white-space:nowrap}
  .ipck-nav a,.ipck-nav span{white-space:nowrap;flex:0 0 auto}
  .ipck-top{padding:14px 16px 12px}
  .ipck-top h1{font-size:18px;white-space:normal;overflow-wrap:anywhere}
  .ipck-head-text{padding-right:92px;min-width:0}
  .ipck-lang-switch{position:fixed;top:9px;right:12px;z-index:20;white-space:nowrap}
  .ipck-runbar{padding:12px 14px 4px;max-width:none}
  .ipck-run-main{width:100%;padding:15px 14px;border-radius:10px;border:1px solid var(--green);box-shadow:0 6px 18px rgba(61,220,151,.18);font-size:16px}
  .ipck-run-note{padding:0 2px}
}

/* ==========================================================================
   [v34 本轮变更] 法务入口移到页面最下方
   顶部导航只保留 3 个工具入口；页脚法务链接横排、手机自动换行，
   沿用站点深色变量与卡片配色，不再被右上角语言按钮遮挡。
   ========================================================================== */
.ipck-legalbar{border-top:1px solid var(--line);background:#0a0f1e;padding:12px 28px}
.ipck-legal-nav{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center}
.ipck-legal-nav a{color:var(--muted);text-decoration:none;font-size:12px;font-family:var(--sans);padding:2px 0;border-bottom:1px solid transparent;white-space:nowrap}
.ipck-legal-nav a:hover{color:var(--text);border-bottom-color:var(--line)}
.ipck-legal-nav a.is-active{color:var(--green);border-bottom-color:#1f6b4d}
@media(max-width:860px){
  .ipck-legalbar{padding:12px 16px}
  .ipck-legal-nav{gap:8px 14px}
  /* [v37 本轮变更] 手机端完整显示网站名：站名独占第一行，三个工具入口第二行横排，
     语言按钮继续固定右上角。不再用 font-size:0 把「ipckit」藏掉。 */
  .ipck-side{flex-wrap:wrap;padding:10px 84px 10px 12px;gap:6px;row-gap:8px}
  .ipck-brand{flex:0 0 100%;font-size:15px;gap:8px;white-space:nowrap}
  .ipck-brand .ipck-logo{width:24px;height:24px;font-size:11px}
  .ipck-nav{gap:2px;flex:1 1 100%;min-width:0;overflow-x:auto;scrollbar-width:none}
  .ipck-nav::-webkit-scrollbar{display:none}
  .ipck-nav a,.ipck-nav span{padding:5px 6px;font-size:11px;line-height:1.4}
}

/* ==========================================================================
   [v36 外观皮肤层] 只换视觉，不动任何 HTML / 文案 / 判定逻辑
   参照 teal 顶带 + 白色大圆角卡片 + 左标签右值字段行 + 状态圆点 + 绿色主按钮
   用法：把本段整段追加到 src/styles.js 的 CSS 模板字符串末尾（反引号前）
   回退：删掉本段即回到 v35 原深色主题
   注意：本段不注入任何伪元素文本，页面文字全部来自原有 i18n
   ========================================================================== */
:root{
  --bg:#eef4f6;--panel:#ffffff;--panel2:#f5f9fa;--line:#d9e4e8;
  --text:#12313a;--muted:#5c7b84;--green:#12a06a;--gray:#8aa3ab;
  --red:#d64545;--accent:#0e7c86;--teal:#0d717c;--teal-dark:#09565f;
}
body{background:var(--bg)!important;color:var(--text)!important}

/* 侧栏改为 teal 顶部横带 */
.ipck-shell{grid-template-columns:1fr!important;grid-template-rows:auto 1fr}
.ipck-side{
  background:linear-gradient(180deg,var(--teal),var(--teal-dark))!important;
  border:0!important;border-bottom:0!important;
  flex-direction:row!important;align-items:center!important;
  padding:10px 28px!important;gap:14px!important;color:#eaf7f8;
}
.ipck-brand{color:#fff!important;font-size:18px!important;white-space:nowrap}
.ipck-logo{border-color:rgba(255,255,255,.55)!important;color:#fff!important;background:rgba(255,255,255,.12)}
.ipck-side > .ipck-tag{color:rgba(255,255,255,.7)!important;margin:0 0 0 4px!important}
.ipck-nav{flex-direction:row!important;gap:6px!important}
.ipck-nav a,.ipck-nav span{color:rgba(255,255,255,.84)!important;font-size:13px!important;border-color:transparent!important;white-space:nowrap}
.ipck-nav a:hover{color:#fff!important;background:rgba(255,255,255,.14)!important}
.ipck-nav a.is-active{color:#fff!important;background:rgba(255,255,255,.18)!important;border-color:rgba(255,255,255,.26)!important}
.ipck-side-foot{color:rgba(255,255,255,.6)!important;margin-top:0!important;padding-top:0!important;margin-left:auto!important;white-space:nowrap}

/* 标题区继续 teal，白字大标题 */
.ipck-top{background:linear-gradient(180deg,var(--teal-dark),var(--teal))!important;border-bottom:0!important;padding:22px 28px 26px!important}
.ipck-top h1{color:#fff!important;font-size:26px!important;font-weight:700!important}
.ipck-top p{color:rgba(255,255,255,.8)!important;font-size:13px!important}
.ipck-lang-switch{background:rgba(255,255,255,.14)!important;border-color:rgba(255,255,255,.42)!important;color:#fff!important;top:18px!important}
/* [v36.2 修正] 诊断条不再全宽贴边：改成与绿色主按钮同款的圆角留缝卡片
   - 两侧留缝：手机 14px / PC 28px（与 .ipck-runbar 对齐）
   - 四角圆角 12px + 轻投影，白色卡面，深色文字
   - 默认「尚未检测」照常显示，JS 写入的完成 / 超时 / 错误状态照常显示 */
.ipck-diag{
  background:#fff!important;color:var(--text)!important;
  border:1px solid var(--line)!important;border-radius:12px!important;
  box-shadow:0 6px 22px rgba(13,113,124,.10)!important;
  border-bottom:1px solid var(--line)!important;min-height:0!important;
  width:calc(100% - 28px)!important;max-width:1040px!important;
  margin:10px 14px 0!important;padding:10px 16px!important;
  font-family:inherit!important;font-size:12px!important;line-height:1.6!important;
}
@media(min-width:861px){
  .ipck-diag{width:calc(100% - 56px)!important;margin:10px auto 0!important;padding:10px 20px!important}
}
.ipck-diag-ok,.ipck-diag .ipck-diag-ok{color:#0f8d5d!important}
.ipck-diag-bad,.ipck-diag .ipck-diag-bad{color:#c0392b!important}
.ipck-diag-warn,.ipck-diag .ipck-diag-warn{color:#a9740b!important}

/* 内容区浅底 + 白色大圆角卡 */
/* 内容区用 teal 大底托起白色卡片（对照模板的主体视觉） */
.ipck-main{background:linear-gradient(180deg,#0d717c,#0a606a)!important}
.ipck-content{color:#eaf7f8!important}
/* 卡片内部恢复深色文字，卡片外的说明文字用浅色 */
.ipck-panel,.ipck-method,.ipck-legal,.ipck-lookup,.ipck-verdict,.ipck-hint,.ipck-cross,.ipck-net-legend,.ipck-subject,.ipck-error-box,.ipck-privacy{color:var(--text)!important}
.ipck-run-note,.ipck-precision,.ipck-scope,.ipck-empty,.ipck-disclaimer,.ipck-swipe-hint,.ipck-sub-title,.ipck-result-title,.ipck-build,.ipck-attr,.ipck-sb-attr,.ipck-legend-line{color:rgba(255,255,255,.86)!important}
.ipck-content h1,.ipck-method h2,.ipck-legal h2{color:var(--text)!important}
.ipck-sub-title{color:#ffffff!important}
.ipck-result-title{color:#ffffff!important}
.ipck-disclaimer{border-top-color:rgba(255,255,255,.24)!important}

.ipck-content{background:linear-gradient(180deg,#0d717c,#0a606a)!important;padding:24px 28px 32px!important;max-width:1100px;width:100%;margin:0 auto}
.ipck-panel,.ipck-method,.ipck-legal,.ipck-lookup{
  background:var(--panel)!important;border:1px solid var(--line)!important;
  border-radius:14px!important;box-shadow:0 6px 22px rgba(13,113,124,.08)!important;
}
.ipck-panel h2,.ipck-lookup-head h2{color:var(--muted)!important}
.ipck-content h1,.ipck-content h2,.ipck-method h2,.ipck-legal h2{color:var(--text)!important}
.ipck-cols{gap:16px!important}

/* 左标签右值字段行 */
.ipck-field{background:var(--panel2)!important;border-color:var(--line)!important;
  display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;
  border-radius:9px!important;padding:11px 14px!important}
.ipck-field span{display:inline!important;margin:0!important;color:var(--muted)!important;white-space:nowrap;font-size:12px!important}
.ipck-field b{color:var(--text)!important;text-align:right!important;max-width:64%;font-size:13px!important}
.ipck-summary-ip b,.ipck-big{color:var(--text)!important}
.ipck-summary-ip span{color:var(--muted)!important}

/* 表格浅色（滚动条仍常显） */
.ipck-table th{color:var(--muted)!important;border-bottom-color:var(--line)!important}
.ipck-table td{border-bottom-color:#e7eff1!important;color:var(--text)!important}
.ipck-table-wrap{scrollbar-color:var(--green) #e2edef!important}
.ipck-table-wrap::-webkit-scrollbar-track{background:#e2edef!important}
.ipck-table-wrap::-webkit-scrollbar-thumb{background:var(--green)!important;border-color:#e2edef!important}
.ipck-swipe-hint{color:var(--muted)!important}

/* 三态卡：白底 + 彩色左条 */
.ipck-verdict{background:var(--panel)!important;border:1px solid var(--line)!important;border-left:4px solid var(--gray)!important;box-shadow:0 4px 16px rgba(13,113,124,.07)!important}
.ipck-verdict.ok{border-left-color:var(--green)!important;background:#f6fdf9!important}
.ipck-verdict.leak{border-left-color:var(--red)!important;background:#fff7f7!important}
.ipck-verdict.gray{background:var(--panel2)!important}
.ipck-verdict h3{color:var(--text)!important}
.ipck-verdict.ok h3{color:var(--green)!important}
.ipck-verdict.leak h3{color:var(--red)!important}
.ipck-verdict.gray h3{color:var(--muted)!important}
.ipck-verdict p,.ipck-verdict-note,.ipck-verdict-sup,.ipck-verdict-exit{color:var(--muted)!important}
.ipck-verdict-note{border-top-color:var(--line)!important}
.ipck-disclaimer{border-top-color:var(--line)!important}

/* 提示 / 徽标 / 错误框 浅色化 */
.ipck-hint,.ipck-cross,.ipck-net-legend,.ipck-subject{background:var(--panel2)!important;border-color:var(--line)!important;color:var(--text)!important}
.ipck-hint p,.ipck-cross p,.ipck-net-legend b{color:var(--muted)!important}
.ipck-cross.ok{border-color:#9dd9bd!important}.ipck-cross.warn{border-color:#e8cf8a!important}
.ipck-hint.warn,.ipck-risk-note{background:#fff8e8!important;border-color:#e8cf8a!important;color:#7a5a12!important}
.ipck-hint.warn b,.ipck-hint.warn p{color:#7a5a12!important}
.ipck-risk-note{color:#7a5a12!important}
.ipck-error-box{background:#fff5f5!important;border-color:#e8a3a3!important;color:#a33!important}
.ipck-error-box b{color:var(--red)!important}.ipck-error-box p{color:#a55!important}
.ipck-badge.pub{color:var(--green)!important;border-color:#9dd9bd!important;background:#e9faf1!important}
.ipck-badge.priv{color:#8a6812!important;border-color:#e8cf8a!important;background:#fff8e8!important}
.ipck-badge.other{color:var(--muted)!important;border-color:var(--line)!important;background:var(--panel2)!important}
.ipck-tag.ok{color:var(--green)!important;background:#e9faf1!important;border-color:#9dd9bd!important}
.ipck-tag.bad{color:var(--red)!important;background:#fff1f1!important;border-color:#e8a3a3!important}
.ipck-dot.g{background:var(--green)!important}.ipck-dot.r{background:var(--red)!important}.ipck-dot.n{background:var(--gray)!important}
.ipck-legend-line{color:var(--muted)!important}
.ipck-net-legend b{color:var(--muted)!important}

/* 绿色主按钮 */
.ipck-runbar{max-width:1100px!important}
.ipck-run-main{background:var(--green)!important;border-color:var(--green)!important;color:#fff!important;
  border-radius:10px!important;box-shadow:0 6px 18px rgba(18,160,106,.22)!important}
.ipck-run-main:hover{background:#0f8d5d!important;border-color:#0f8d5d!important}
.ipck-run-main:disabled{opacity:.65!important}
.ipck-privacy p,.ipck-method ol,.ipck-legal p{color:var(--muted)!important}

/* 页脚 / 署名 / 法务 / 输入 */
.ipck-sourcebar,.ipck-legalbar{background:#074a52!important;border-top:1px solid rgba(255,255,255,.14)!important;color:rgba(255,255,255,.72)!important}
.ipck-legal-nav a{color:rgba(255,255,255,.8)!important}
.ipck-legal-nav a:hover,.ipck-legal-nav a.is-active{color:#7ff0bd!important}
.ipck-attr a,.ipck-sb-attr a,.ipck-legal a,.ipck-attr-block a{color:#7ff0bd!important}
.ipck-attr-version{color:var(--green)!important}
.ipck-attr-block{border-top-color:var(--line)!important}
.ipck-legal-meta{border-top-color:var(--line)!important}
.ipck-btn:not(.ipck-run-main){background:#fff!important;color:var(--text)!important;border-color:var(--line)!important}
.ipck-btn:not(.ipck-run-main):hover{background:var(--panel2)!important}
.ipck-btn.ghost{background:transparent!important;color:var(--muted)!important}
.ipck-lookup-row input{background:#fff!important;color:var(--text)!important;border-color:var(--line)!important}
.ipck-lookup-row input::placeholder{color:var(--gray)!important}
.ipck-spinner{border-color:#d9e4e8!important;border-top-color:var(--green)!important}
.ipck-loading{color:var(--accent)!important}
.ipck-progress{background:#dfeaec!important}.ipck-progress-fill{background:var(--green)!important}
.ipck-build{color:var(--muted)!important}

/* 手机端：保留 v32/v34 的留缝圆角 / 语言右上 / 滚动条常显 / 品牌不竖排 */
@media(max-width:860px){
  .ipck-side{flex-wrap:wrap!important;padding:10px 84px 10px 12px!important;gap:6px!important;row-gap:8px!important;min-height:46px}
  .ipck-brand{flex:0 0 100%!important;font-size:16px!important;gap:8px!important;color:#fff!important;white-space:nowrap}
  .ipck-brand .ipck-logo{width:24px!important;height:24px!important;font-size:11px!important}
  .ipck-nav{flex-direction:row!important;gap:2px!important;flex:1 1 100%!important;min-width:0;overflow-x:auto;scrollbar-width:none}
  .ipck-nav::-webkit-scrollbar{display:none}
  .ipck-nav a,.ipck-nav span{padding:5px 6px!important;font-size:11px!important;line-height:1.4!important;white-space:nowrap;flex:0 0 auto}
  .ipck-top{padding:16px 16px 20px!important}
  .ipck-top h1{font-size:21px!important;white-space:normal;overflow-wrap:anywhere}
  .ipck-head-text{padding-right:92px!important;min-width:0}
  .ipck-lang-switch{position:fixed!important;top:9px!important;right:12px!important;z-index:20;white-space:nowrap;
    background:rgba(255,255,255,.94)!important;color:var(--teal-dark)!important;border-color:rgba(13,113,124,.35)!important}
  .ipck-content{padding:16px 14px 26px!important;gap:14px!important}
  .ipck-cols{grid-template-columns:1fr!important}
  .ipck-runbar{padding:12px 14px 4px!important;max-width:none!important}
  .ipck-run-main{width:100%!important;padding:15px 14px!important;border-radius:10px!important;
    border:1px solid var(--green)!important;box-shadow:0 6px 18px rgba(18,160,106,.22)!important;font-size:16px!important}
  .ipck-run-note{padding:0 2px!important}
  .ipck-field{flex-direction:column!important;align-items:flex-start!important;gap:3px!important}
  .ipck-field b{max-width:100%!important;text-align:left!important}
  .ipck-grid-fields{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
  .ipck-table-wrap{overflow-x:auto!important;scrollbar-width:thin!important;padding-bottom:10px!important}
  .ipck-table-wrap::-webkit-scrollbar{height:10px!important;display:block!important}
  .ipck-legalbar,.ipck-sourcebar{padding:12px 16px!important}
  .ipck-lookup{margin:14px 14px 0!important;padding:14px!important}
}

/* 主按钮兜底：放在皮肤层最后，确保绿色实心不被任何同特异性规则压掉 */
.ipck-run-main,.ipck-run-main:hover{background:var(--green)!important;border-color:var(--green)!important;color:#fff!important}
.ipck-run-main:hover{background:#0f8d5d!important;border-color:#0f8d5d!important}

/* ==========================================================================
   [v38 本轮变更 · 统一宽度层] 从上到下所有可见块左右边界完全一致
   根因：.ipck-lookup 是 .ipck-main 的直接子元素，PC 端只有 margin:16px 28px 0、
   没有 max-width，1440 视口下宽 1384px，比 1100px 内容区 / 1044px 绿色按钮
   宽出 284px —— 就是「查询 IP 那条白色框框超出来」。
   统一公式：可见块宽 = min(100%, 1100px) - 56px，水平居中；
   手机端 = 100% - 28px（左右各 14px 留缝、四角圆角）。
   teal 大底移到 .ipck-main 全宽，.ipck-content 只做居中容器、不再自带窄背景。
   只改视觉，不动任何 HTML / 文案 / 判定逻辑 / SEO 字段。
   ========================================================================== */
:root{--ipck-outer:1100px;--ipck-gut:28px}
@media(min-width:861px){
  .ipck-main{background:linear-gradient(180deg,#0d717c,#0a606a)!important}
  .ipck-content{background:transparent!important;max-width:var(--ipck-outer)!important;
    width:100%!important;margin:0 auto!important;padding:24px var(--ipck-gut) 32px!important}
  .ipck-runbar{max-width:var(--ipck-outer)!important;width:100%!important;
    margin:0 auto!important;padding:20px var(--ipck-gut) 4px!important}
  .ipck-lookup{width:calc(100% - 56px)!important;max-width:1044px!important;
    margin:16px auto 0!important;padding:16px 18px!important}
  .ipck-diag{width:calc(100% - 56px)!important;max-width:1044px!important;
    margin:10px auto 0!important;padding:10px 20px!important}
  .ipck-legal,.ipck-privacy{max-width:100%!important}
  /* 顶带 / 标题 / 页脚：背景仍全宽，内部文字对齐到与白卡相同的左右边界 */
  .ipck-side,.ipck-top,.ipck-sourcebar,.ipck-legalbar{
    padding-left:calc((100% - min(100%, var(--ipck-outer))) / 2 + var(--ipck-gut))!important;
    padding-right:calc((100% - min(100%, var(--ipck-outer))) / 2 + var(--ipck-gut))!important}
  .ipck-lang-switch{right:calc((100% - min(100%, var(--ipck-outer))) / 2 + var(--ipck-gut))!important}
}
@media(max-width:860px){
  .ipck-content{background:transparent!important;max-width:none!important;width:100%!important;
    margin:0!important;padding:16px 14px 26px!important}
  .ipck-runbar{max-width:none!important;width:100%!important;
    margin:0!important;padding:12px 14px 4px!important}
  .ipck-lookup{width:calc(100% - 28px)!important;max-width:none!important;
    margin:14px 14px 0!important;padding:14px!important}
  .ipck-diag{width:calc(100% - 28px)!important;max-width:none!important;
    margin:10px 14px 0!important;padding:10px 16px!important}
  .ipck-legal,.ipck-privacy{max-width:100%!important}
  .ipck-side{padding:10px 84px 10px 14px!important}
  .ipck-top,.ipck-sourcebar,.ipck-legalbar{padding-left:14px!important;padding-right:14px!important}
  .ipck-run-main,.ipck-lookup,.ipck-diag,.ipck-panel,.ipck-verdict{border-radius:12px!important}
}


/* ==========================================================================
   [v39 本轮变更] 全站文字可读性收口 + 品牌图标 + 顶带对齐 + 联系方式落位
   根因：v36 皮肤层把「白卡内的链接」和「深 teal 底页脚的链接」用同一条浅绿
   #7ff0bd 覆盖 —— 浅绿压白卡对比度约 1.9:1，法务页邮箱、结果区 CC BY 4.0
   署名几乎看不见；页脚 .ipck-attr-block b 又继承深色 --text 压在 #074a52 上。
   本层按「容器底色」拆成两套语义色，并统一去掉文字透明度、抬字号与字重。
   仅改视觉，不动任何文案 / 判定逻辑 / SEO 字段 / URL。
   ========================================================================== */
:root{
  --ink:#12313a;          /* 白卡正文 */
  --ink-soft:#33575f;     /* 白卡次要说明，白底对比 >= 7:1 */
  --ink-link:#075e6a;     /* 白卡链接，白底对比 >= 7:1 */
  --on-dark:#ffffff;      /* teal 深底正文 */
  --on-dark-soft:#f0fffa; /* teal 深底次要 */
  --on-dark-link:#a8ffd8; /* teal 深底链接，对比 >= 8:1 */
}

/* 1) 品牌图标：换成 38px 地球+出口节点 SVG，不再是两个字母 */
.ipck-logo{width:38px!important;height:38px!important;border:0!important;
  background:transparent!important;padding:0!important;border-radius:0!important;
  display:block!important;font-size:0!important;color:transparent!important}
.ipck-logo-svg{width:38px;height:38px;display:block;flex:0 0 auto}
.ipck-brand{gap:11px!important;font-size:19px!important;letter-spacing:.01em;font-weight:700!important}

/* 2) 语言按钮移到顶带右上角，与站名同一行对齐；PC / 手机统一，不再 fixed 漂浮 */
.ipck-side{position:relative!important}
.ipck-side .ipck-lang-switch{position:absolute!important;z-index:8!important;top:14px!important;
  right:calc((100% - min(100%, var(--ipck-outer))) / 2 + var(--ipck-gut))!important;
  background:rgba(255,255,255,.16)!important;border-color:rgba(255,255,255,.62)!important;
  color:#fff!important;font-size:13px!important;font-weight:600!important;
  padding:9px 14px!important;line-height:1.2!important}
.ipck-side .ipck-lang-switch:hover{background:rgba(255,255,255,.28)!important;color:#fff!important}
.ipck-head-text{padding-right:0!important}
.ipck-top-row{display:block!important}

/* 3) 联系方式 + 版本号：从侧栏移到页面最下方页脚，PC / 手机都可见且清晰 */
.ipck-legalbar{display:flex!important;flex-wrap:wrap!important;align-items:center!important;
  justify-content:space-between!important;gap:10px 20px!important}
.ipck-legal-nav{gap:10px 20px!important}
.ipck-foot-contact{display:flex!important;align-items:center!important;gap:12px!important;white-space:nowrap}
.ipck-foot-contact-label{color:var(--on-dark-soft)!important;font-size:13px!important;font-weight:500!important}
.ipck-foot-contact a{color:var(--on-dark-link)!important;font-size:13px!important;font-weight:700!important;
  text-decoration:underline!important;text-underline-offset:3px;opacity:1!important}
.ipck-foot-contact .ipck-build{color:#fff!important;font-size:13px!important;font-weight:700!important;
  opacity:1!important;background:rgba(255,255,255,.14);padding:3px 9px;border-radius:7px}

/* 4) 白卡内：正文 / 次要说明统一深墨、加大、加粗、去掉一切透明度 */
.ipck-panel,.ipck-method,.ipck-legal,.ipck-lookup,.ipck-verdict,.ipck-hint,
.ipck-cross,.ipck-net-legend,.ipck-subject,.ipck-error-box,.ipck-privacy,.ipck-diag{
  color:var(--ink)!important;font-size:14px!important}
.ipck-panel h2,.ipck-lookup-head h2,.ipck-field span,.ipck-summary-ip span,
.ipck-table th,.ipck-legend-line,.ipck-net-legend b,.ipck-panel .ipck-result-title,
.ipck-panel .ipck-sub-title{color:var(--ink-soft)!important;font-size:13px!important;
  font-weight:700!important;opacity:1!important;text-transform:none!important;letter-spacing:.01em!important}
.ipck-panel p,.ipck-method ol,.ipck-method li,.ipck-privacy p,.ipck-legal p,
.ipck-legal-meta,.ipck-legal-links,.ipck-verdict p,.ipck-verdict-note,
.ipck-verdict-sup,.ipck-verdict-exit,.ipck-hint p,.ipck-cross p,.ipck-scope,
.ipck-precision,.ipck-empty,.ipck-lookup-head p,.ipck-attr,.ipck-sb-attr,
.ipck-attr-block,.ipck-diag,.ipck-swipe-hint,.ipck-attr-note,.ipck-field span{
  color:var(--ink-soft)!important;font-size:13px!important;font-weight:500!important;
  line-height:1.85!important;opacity:1!important}
.ipck-attr-block b{color:var(--ink)!important;font-weight:700!important;font-size:13px!important;opacity:1!important}
.ipck-attr-note{display:block!important;opacity:1!important}
.ipck-legal-meta,.ipck-legal-links{font-size:13px!important;opacity:1!important}
.ipck-verdict-note,.ipck-verdict-sup{font-size:13px!important;opacity:1!important}
.ipck-verdict h3{font-size:17px!important;font-weight:700!important}
.ipck-btn.ghost{color:var(--ink)!important;font-weight:600!important;font-size:13px!important}
.ipck-lookup-row input::placeholder{color:#476c74!important;opacity:1!important}

/* 5) 白卡内链接：深青加粗带下划线；深底页脚链接另走浅绿高亮 */
.ipck-legal a,.ipck-privacy a,.ipck-method a,.ipck-panel a:not(.ipck-lang),
.ipck-verdict a,.ipck-attr a,.ipck-sb-attr a,.ipck-hint a,.ipck-cross a,
.ipck-lookup a,.ipck-diag a{color:var(--ink-link)!important;font-weight:700!important;
  text-decoration:underline!important;text-underline-offset:3px;opacity:1!important}
.ipck-legal a:hover,.ipck-attr a:hover{color:#04454f!important}

/* 6) teal 大底上、白卡之外的说明文字：纯白、13px、不透明 */
.ipck-runbar .ipck-run-note,.ipck-content > .ipck-disclaimer,
.ipck-content > .ipck-swipe-hint,.ipck-content > .ipck-sub-title,
.ipck-content > .ipck-result-title{color:var(--on-dark)!important;font-size:13px!important;
  font-weight:600!important;opacity:1!important;line-height:1.85!important}
.ipck-content > .ipck-disclaimer{border-top-color:rgba(255,255,255,.5)!important;
  padding-top:14px!important;font-size:13px!important}

/* 7) 页脚 / 署名：深 teal 底一律浅字；之前 b 是深色 --text 压深底，几乎不可见 */
.ipck-sourcebar,.ipck-legalbar{color:var(--on-dark-soft)!important;font-size:13px!important}
.ipck-sourcebar *,.ipck-legalbar *{opacity:1!important}
.ipck-sourcebar .ipck-attr-block,.ipck-sourcebar .ipck-attr,.ipck-sourcebar .ipck-sb-attr,
.ipck-sourcebar .ipck-sb{font-size:13px!important;line-height:1.9!important;
  color:var(--on-dark-soft)!important;font-weight:500!important}
.ipck-sourcebar .ipck-attr-block b{color:#fff!important;font-weight:700!important;font-size:13px!important}
.ipck-sourcebar .ipck-attr-block a,.ipck-sourcebar .ipck-attr a,
.ipck-sourcebar .ipck-sb-attr a,.ipck-sourcebar a{color:var(--on-dark-link)!important;
  font-weight:700!important;text-decoration:underline!important;text-underline-offset:3px}
.ipck-sourcebar .ipck-attr-version,.ipck-sourcebar .ipck-build{color:#fff!important;
  font-weight:700!important;font-size:13px!important}
.ipck-sourcebar .ipck-attr-block{border-top-color:rgba(255,255,255,.4)!important}
.ipck-legal-nav a{color:#fff!important;font-size:13px!important;font-weight:600!important}
.ipck-legal-nav a:hover,.ipck-legal-nav a.is-active{color:var(--on-dark-link)!important}
.ipck-side .ipck-tag{color:rgba(255,255,255,.92)!important;font-size:13px!important;font-weight:500!important}
.ipck-nav a,.ipck-nav span{font-size:13px!important;font-weight:600!important;
  color:#fff!important;opacity:1!important}

/* 8) 手机端：图标 34px、语言按钮与站名同一行右侧、页脚联系方式换行 */
@media(max-width:860px){
  .ipck-side{padding:10px 108px 10px 14px!important;min-height:56px!important}
  .ipck-brand{font-size:17px!important;gap:9px!important}
  .ipck-logo,.ipck-logo-svg{width:34px!important;height:34px!important}
  .ipck-side .ipck-lang-switch{top:14px!important;right:14px!important;
    background:rgba(255,255,255,.96)!important;color:#075e6a!important;
    border-color:rgba(13,113,124,.45)!important;padding:8px 11px!important;font-size:12px!important}
  .ipck-side .ipck-lang-switch:hover{background:#fff!important;color:#075e6a!important}
  .ipck-foot-contact{flex:0 0 100%!important;white-space:normal;flex-wrap:wrap;gap:8px 12px!important}
  .ipck-legalbar{gap:12px 16px!important}
  .ipck-nav a,.ipck-nav span{font-size:12px!important;padding:6px 8px!important}
  .ipck-panel p,.ipck-legal p,.ipck-method ol,.ipck-verdict p{font-size:13px!important}
}

/* 9) [v39 收口补] 状态色加深：小字绿/红在浅底上原本只有 3.2~4.2:1，统一提到 >=4.5 */
:root{--green:#0c8a5d;--red:#b83535}
.ipck-badge{font-size:12px!important;font-weight:700!important}
.ipck-badge.pub,.ipck-tag.ok{color:#0a7349!important}
.ipck-badge.priv{color:#75500a!important}
.ipck-badge.other{color:var(--ink-soft)!important}
.ipck-diag-ok.ipck-diag-ok,.ipck-diag .ipck-diag-ok,.ipck-verdict.ok h3{color:#0a7349!important}
.ipck-diag-warn.ipck-diag-warn,.ipck-diag .ipck-diag-warn{color:#855707!important}
.ipck-diag-bad.ipck-diag-bad,.ipck-diag .ipck-diag-bad,.ipck-verdict.leak h3,.ipck-tag.bad,.ipck-error-box b{color:#a62d2d!important}
.ipck-top p{color:rgba(255,255,255,.96)!important;font-size:13px!important;font-weight:600!important}

/* ==========================================================================
   [v40 本轮变更] 侧栏标语升级为站点定位标题 + 手机端恢复显示
   根因：v32 在 @media(max-width:860px) 里写了
     .ipck-side > .ipck-tag{display:none!important}
   v36/v39 只改了它的颜色字号，从没覆盖 display，所以手机端一直看不到这句。
   - PC：15.5px 加粗纯白，与站名同处顶带第一行；顶带允许换行，窄 PC 窗口不溢出
   - 手机：标语独占一行、自动换行、12.5px；语言按钮仍与站名同一行右侧，
     导航落到第三行，互不遮挡；容器右内边距 108px 继续给语言按钮留位
   - 选择器只命中 .ipck-side > .ipck-tag。结果区 .ipck-tag.ok / .ipck-tag.bad
     是另一套状态徽标（在 .ipck-content 内），完全不受影响。
   ========================================================================== */
.ipck-side{flex-wrap:wrap!important}
.ipck-side > .ipck-tag{
  display:block!important;
  color:#fff!important;
  font-size:15.5px!important;
  font-weight:650!important;
  letter-spacing:.01em!important;
  line-height:1.4!important;
  white-space:normal!important;
  overflow-wrap:anywhere;
  margin:0 0 0 4px!important;
}
@media(max-width:860px){
  .ipck-side{row-gap:6px!important}
  .ipck-side > .ipck-tag{
    flex:0 0 100%!important;
    font-size:12.5px!important;
    line-height:1.4!important;
    margin:0!important;
    padding-right:2px;
  }
  /* [v40 收口] 英文 3 个导航项实际需 317px，而手机侧栏内容区只有 268px
     （右侧 108px 让给右上角语言按钮），第三项文字被 overflow-x:auto 裁掉、
     要横滑才看得见。用负 margin 把导航行扩到整屏可用宽度：
     不缩字号、不减 padding、不动语言按钮位置，也不需要横滑。 */
  .ipck-nav{margin-right:-94px!important;overflow:visible!important}
}

`;