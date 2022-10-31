import { unZipFromFile } from 'https://deno.land/x/zip@v1.1.0/mod.ts';
// import { parseBuffer } from "https://deno.land/x/bplist_parser@0.4.0/mod.ts";
import { parseBuffer } from "./bplistParser.ts";
import {curvesFromSession, curvesFromSessionObject, SessionData} from "./sessionCurves.ts";
import {win32 as winPath, posix as posixPath} from "https://deno.land/std@0.160.0/path/mod.ts";
import { generateSvg } from './svgCurves.ts';
import { generatePdf } from './pdfGen.ts';
import { resolveObjects } from './plistResolution.ts';
import { NoteTakingSession } from './types.ts';
import { parse as parseFlags } from "https://deno.land/std@0.161.0/flags/mod.ts";
console.log("Denotability v1");
console.log("Notability Viewer Alpha 0.1");

// const OPTIONS = {
//     input: "resources/.note",
//     outputOptions: {
//         svg: "out/note1.svg",
//     },
//     persistTempDir: true
// }


// Deno.writeTextFile("./tmpOut/metadata.json", JSON.stringify(await bplistParse(`${destPath}/${innerName}/metadata.plist`), null, "\t"));
// Deno.mkdir("./tmpOut/HandwritingIndex/");
// Deno.writeTextFile("./tmpOut/HandwritingIndex/index.json", JSON.stringify(await bplistParse(`${destPath}/${innerName}/HandwritingIndex/index.plist`), null, "\t"));
let found = false;
for await (const dirEntry of Deno.readDir("./")) {
    if(dirEntry.name == "tmpOut") found = true;
}
if(found) Deno.remove("./tmpOut", {recursive: true});

const destPath = await unZipFromFile("./resources/oct20.note", "./tmpOut");
if(typeof destPath !== 'string') Deno.exit();
let innerName = "";
for await(const dirEntry of Deno.readDir(destPath)) {
    console.log(dirEntry);
    innerName = dirEntry.name;
}

const sessionBPList = await Deno.readFile(`${destPath}/${innerName}/Session.plist`);
const sessionObject = parseBuffer(sessionBPList);
const session = resolveObjects(sessionObject) as NoteTakingSession;
// const curves = curvesFromSessionObject(sessionObject as SessionData);
const curves = curvesFromSession(session);
const svg = generateSvg(curves);
// const pdf = await generatePdf(curves);
Deno.writeTextFile("./out.svg", svg);
// Deno.writeFile("./out.pdf", pdf);
Deno.writeTextFile("./tmpOut/Session.json", JSON.stringify(sessionObject, null, "\t"));
Deno.writeTextFile("./tmpOut/ResolvedSession.json", JSON.stringify(session, null, "\t"));