import fs from "fs";
import {
  buildPfpSvg,
  buildBuilderIdSvg,
  buildTeamFrameSvg,
} from "../src/lib/svgTemplateEngine.js";

const outputDir = "./public/assets/previews";

fs.mkdirSync(outputDir, { recursive: true });

const pfp = await buildPfpSvg({
  photoDataUrl: null,
  crop: null,
});

const builder = await buildBuilderIdSvg({
  photoDataUrl: null,
  crop: null,
  name: "YOUR NAME",
  builderTitle: "BUILDER TITLE",
  stack: "YOUR STACK",
  team: "YOUR TEAM",
  xHandle: "@HANDLE",
  qrText: "https://hhgoa.com",
});

const team = await buildTeamFrameSvg({
  photoDataUrl: null,
  crop: null,
  teamName: "TEAM NAME",
  members: ["MEMBER 1", "MEMBER 2", "MEMBER 3"],
  quote: "YOUR QUOTE",
  qrText: "https://hhgoa.com",
});

fs.writeFileSync(`${outputDir}/pfp-preview.svg`, pfp);
fs.writeFileSync(`${outputDir}/builder-preview.svg`, builder);
fs.writeFileSync(`${outputDir}/team-preview.svg`, team);

console.log("Preview SVGs generated successfully.");