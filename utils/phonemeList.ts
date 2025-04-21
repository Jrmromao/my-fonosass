// interface Option {
//     value: string;
//     label: string;
// }
//
// const phonemes: Option[] = [
//     // Vogais Orais
//     { value: "/i/", label: "Vogal Oral - /i/ (piso)" },
//     { value: "/e/", label: "Vogal Oral - /e/ (mesa)" },
//     { value: "/ɛ/", label: "Vogal Oral - /ɛ/ (pé)" },
//     { value: "/a/", label: "Vogal Oral - /a/ (casa)" },
//     { value: "/ɐ/", label: "Vogal Oral - /ɐ/ (banana)" },
//     { value: "/ɔ/", label: "Vogal Oral - /ɔ/ (porta)" },
//     { value: "/o/", label: "Vogal Oral - /o/ (ovo)" },
//     { value: "/u/", label: "Vogal Oral - /u/ (luz)" },
//
//     // Vogais Nasais
//     { value: "/ĩ/", label: "Vogal Nasal - /ĩ/ (sim)" },
//     { value: "/ẽ/", label: "Vogal Nasal - /ẽ/ (tem)" },
//     { value: "/ɐ̃/", label: "Vogal Nasal - /ɐ̃/ (mão)" },
//     { value: "/õ/", label: "Vogal Nasal - /õ/ (bom)" },
//     { value: "/ũ/", label: "Vogal Nasal - /ũ/ (mundo)" },
//
//     // Consoantes Plosivas
//     { value: "/p/", label: "Consoante Plosiva - /p/ (pato)" },
//     { value: "/b/", label: "Consoante Plosiva - /b/ (boca)" },
//     { value: "/t/", label: "Consoante Plosiva - /t/ (teto)" },
//     { value: "/d/", label: "Consoante Plosiva - /d/ (dado)" },
//     { value: "/k/", label: "Consoante Plosiva - /k/ (casa)" },
//     { value: "/ɡ/", label: "Consoante Plosiva - /ɡ/ (gato)" },
//
//     // Consoantes Fricativas
//     { value: "/f/", label: "Consoante Fricativa - /f/ (fato)" },
//     { value: "/v/", label: "Consoante Fricativa - /v/ (vaca)" },
//     { value: "/s/", label: "Consoante Fricativa - /s/ (sapo)" },
//     { value: "/z/", label: "Consoante Fricativa - /z/ (zebra)" },
//     { value: "/ʃ/", label: "Consoante Fricativa - /ʃ/ (chave)" },
//     { value: "/ʒ/", label: "Consoante Fricativa - /ʒ/ (jogo)" },
//
//     // Consoantes Nasais
//     { value: "/m/", label: "Consoante Nasal - /m/ (mãe)" },
//     { value: "/n/", label: "Consoante Nasal - /n/ (nove)" },
//     { value: "/ɲ/", label: "Consoante Nasal - /ɲ/ (banho)" },
//
//     // Consoantes Líquidas
//     { value: "/l/", label: "Consoante Líquida - /l/ (luz)" },
//     { value: "/ʎ/", label: "Consoante Líquida - /ʎ/ (milho)" },
//     { value: "/ɾ/", label: "Consoante Líquida - /ɾ/ (caro)" },
//     { value: "/ʁ/", label: "Consoante Líquida - /ʁ/ (rato)" },
//
//     // Ditongos Crescentes
//     { value: "/jɐ/", label: "Ditongo Crescente - /jɐ/ (viagem)" },
//     { value: "/jɛ/", label: "Ditongo Crescente - /jɛ/ (péssimo)" },
//     { value: "/wɐ/", label: "Ditongo Crescente - /wɐ/ (quase)" },
//
//     // Ditongos Decrescentes
//     { value: "/aj/", label: "Ditongo Decrescente - /aj/ (pai)" },
//     { value: "/ej/", label: "Ditongo Decrescente - /ej/ (lei)" },
//     { value: "/oj/", label: "Ditongo Decrescente - /oj/ (foi)" },
//     { value: "/aw/", label: "Ditongo Decrescente - /aw/ (mau)" },
//     { value: "/ɛw/", label: "Ditongo Decrescente - /ɛw/ (céu)" },
//     { value: "/ow/", label: "Ditongo Decrescente - /ow/ (pouco)" }
// ];
//
// export default phonemes;

import {colorNames} from "@/components/ballons/constants";

interface Option {
    value: string;
    label: string;
}

const phonemes: Option[] = [
    { value: "B", label: "B (boca)" },
    { value: "P", label: "P (pato)" },
    { value: "M", label: "M (mãe)" },
    { value: "T", label: "T (teto)" },
    { value: "D", label: "D (dado)" },
    { value: "K", label: "K (casa)" },
    { value: "G", label: "G (gato)" },
    { value: "F", label: "F (fato)" },
    { value: "V", label: "V (vaca)" },
    { value: "S", label: "S (sapo)" },
    { value: "Z", label: "Z (zebra)" },
    { value: "SH", label: "SH (chave)" },
    { value: "CH", label: "CH (chave)" },
    { value: "J", label: "J (jogo)" },
    { value: "L", label: "L (luz)" },
    { value: "R", label: "R (rato)" },
    { value: "W", label: "W (whisky)" },
    { value: "H", label: "H (hotel)" },
    { value: "Y", label: "Y (yoga)" },
    { value: "NG", label: "NG (sing)" },
    { value: "TH", label: "TH (think)" },
    { value: "DH", label: "DH (this)" },
    { value: "N", label: "N (nove)" },
].sort((a, b) => a.label.localeCompare(b.label));

export default phonemes;


// export const getColorName = (hexColor: string): string => {
//     return colorNames[hexColor] || "Colorful";
// };