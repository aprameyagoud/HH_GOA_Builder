/**
 * Server-rendered HTML for /share/:id with complete Open Graph & Twitter Card tags
 */
export function renderSharePageHtml({
  shareId,
  format = 'pfp',
  caption = 'Framed for HH Goa 2026. 🌴 #FrameInGoa',
  baseUrl = '',
  width = 1200,
  height = 675,
}) {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const shareUrl = `${normalizedBase}/share/${shareId}`;
  const imageUrl = `${normalizedBase}/api/image/${shareId}.png`;

  const formatTitle = format === 'pfp' ? 'PFP FRAME' : format === 'builder_id' ? 'BUILDER ID' : 'TEAM FRAME';
  const pageTitle = `HH Goa 2026 — ${formatTitle}`;

  // Twitter share intent text
  const xShareText = `${caption}\n\n${shareUrl}`;
  const xIntentUrl = `https://x.com/intent/post?text=${encodeURIComponent(xShareText)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${pageTitle}</title>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${shareUrl}" />
  <meta property="og:title" content="${pageTitle}" />
  <meta property="og:description" content="${caption}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="${width}" />
  <meta property="og:image:height" content="${height}" />
  <meta property="og:image:alt" content="HH Goa 2026 Generated Frame" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${shareUrl}" />
  <meta name="twitter:title" content="${pageTitle}" />
  <meta name="twitter:description" content="${caption}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:image:alt" content="HH Goa 2026 Generated Frame" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Imbue:opsz,wght@10..100,100..900&family=Victor+Mono:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet">

  <style>
    :root {
      --hh-dark-green: #004121;
      --hh-bright-green: #03801E;
      --hh-magenta: #FF0080;
      --hh-yellow: #FEE101;
      --hh-cream: #FDF9EC;
      --hh-black: #000000;
      --hh-white: #FFFFFF;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--hh-dark-green);
      background-image: 
        radial-gradient(var(--hh-bright-green) 15%, transparent 16%),
        radial-gradient(var(--hh-bright-green) 15%, transparent 16%);
      background-size: 60px 60px;
      background-position: 0 0, 30px 30px;
      color: var(--hh-white);
      font-family: 'Victor Mono', monospace;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1rem 3rem 1rem;
    }

    .container {
      width: 100%;
      maxWidth: 850px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .badge-bar {
      display: inline-flex;
      align-items: center;
      gap: 0.8rem;
      background-color: var(--hh-black);
      padding: 0.3rem 1rem;
      border: 2px solid var(--hh-yellow);
      margin-bottom: 1rem;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .badge-bar .yellow { color: var(--hh-yellow); }
    .badge-bar .magenta { color: var(--hh-magenta); font-weight: 900; }

    h1 {
      font-family: 'Imbue', serif;
      font-weight: 900;
      font-size: clamp(3rem, 8vw, 5.5rem);
      color: var(--hh-yellow);
      line-height: 0.9;
      margin-bottom: 0.5rem;
      letter-spacing: 1px;
    }

    .card {
      background-color: rgba(0, 0, 0, 0.45);
      border: 3px solid var(--hh-yellow);
      box-shadow: 6px 6px 0px var(--hh-black);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .graphic-container {
      width: 100%;
      background-color: var(--hh-black);
      border: 3px solid var(--hh-black);
      margin-bottom: 1.5rem;
      box-shadow: 4px 4px 0px var(--hh-black);
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .graphic-container img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }

    .caption-box {
      background-color: rgba(0, 0, 0, 0.6);
      border: 2px solid var(--hh-magenta);
      padding: 0.8rem 1.2rem;
      color: var(--hh-yellow);
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      text-align: center;
      word-break: break-word;
    }

    .button-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 600px) {
      .button-grid {
        grid-template-columns: 1fr;
      }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      font-family: 'Victor Mono', monospace;
      font-size: 1rem;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      border: 2px solid var(--hh-black);
      box-shadow: 4px 4px 0px var(--hh-black);
      transition: transform 0.1s, box-shadow 0.1s;
      text-align: center;
    }

    .btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px var(--hh-black);
    }

    .btn-download {
      background-color: var(--hh-yellow);
      color: var(--hh-black);
    }

    .btn-share {
      background-color: var(--hh-magenta);
      color: var(--hh-white);
    }

    .btn-create {
      background-color: transparent;
      color: var(--hh-yellow);
      border: 2px solid var(--hh-yellow);
      width: 100%;
    }

    .btn-create:hover {
      background-color: var(--hh-yellow);
      color: var(--hh-black);
    }

    footer {
      margin-top: auto;
      text-align: center;
      padding-top: 2rem;
      font-size: 0.8rem;
      color: var(--hh-cream);
      opacity: 0.85;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge-bar">
        <span class="yellow">GOA, INDIA · 28–31 OCT 2026</span>
        <span class="magenta">·</span>
        <span>2:47 PM STUDIO</span>
      </div>
      <h1>FRAME YOUR GOA.</h1>
      <p style="color: var(--hh-cream); font-size: 0.95rem; margin-top: 0.3rem;">
        Official HH Goa 2026 Branded Graphic
      </p>
    </header>

    <div class="card">
      <div class="graphic-container">
        <img src="${imageUrl}" alt="HH Goa 2026 Generated Frame" id="mainGraphic" />
      </div>

      <div class="caption-box">
        "${caption}"
      </div>

      <div class="button-grid">
        <a href="${imageUrl}" download="HH-Goa-2026-Frame.png" class="btn btn-download" id="downloadBtn">
          DOWNLOAD PNG
        </a>
        <a href="${xIntentUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-share" id="shareBtn">
          SHARE TO X 🌴
        </a>
      </div>

      <a href="/" class="btn btn-create">
        CREATE YOUR OWN FRAME ➔
      </a>
    </div>

    <footer>
      <p>HACKER HOUSE GOA · 28–31 OCT 2026 · 2:47 PM STUDIO</p>
      <p style="margin-top: 0.3rem; color: var(--hh-yellow);">LESS NOISE. MORE SIGNAL. #FrameInGoa</p>
    </footer>
  </div>

  <script>
    // Handle mobile native share if user clicks Share to X on the share page
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn && navigator.share) {
      shareBtn.addEventListener('click', async (e) => {
        try {
          const imgResponse = await fetch('${imageUrl}');
          const blob = await imgResponse.blob();
          const file = new File([blob], 'HH-Goa-2026-Frame.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            e.preventDefault();
            await navigator.share({
              title: 'HH Goa 2026',
              text: ${JSON.stringify(caption)},
              files: [file]
            });
          }
        } catch (err) {
          // Normal fallback to X intent link
        }
      });
    }
  </script>
</body>
</html>`;
}
