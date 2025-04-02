export const APP_NAME = 'App do Joao'


// constants.ts
export const phonemes: string[] = [
    "P", "L", "K", "T", "S", "CH", "LH", "F", "B", "N", "G", "D", "Z",
    "J", "NH", "V", "M", "R", "ARQ", "C/R/V", "C/L/V", "Vogais"
];

export const balloonColors: string[] = [
    "#ff3333", "#ff9933", "#ffff33", "#33ff33", "#33ffff", "#3333ff", "#9933ff",
    "#ff33ff", "#ff3399", "#99ff33", "#33ff99", "#9999ff", "#ff9999", "#ffcc33",
    "#33ccff", "#cc33ff", "#ffcc99", "#99ffcc", "#cc99ff", "#33cc33", "#ff3366",
    "#66ff33", "#33cccc"
];

interface ColorMapping {
    [key: string]: string;
}

export const colorNames: ColorMapping = {
    "#ff3333": "Red",
    "#ff9933": "Orange",
    "#ffff33": "Yellow",
    "#33ff33": "Green",
    "#33ffff": "Cyan",
    "#3333ff": "Blue",
    "#9933ff": "Purple",
    "#ff33ff": "Magenta",
    "#ff3399": "Pink",
    "#99ff33": "Lime",
    "#33ff99": "Mint",
    "#9999ff": "Lavender",
    "#ff9999": "Light Pink",
    "#ffcc33": "Gold",
    "#33ccff": "Sky Blue",
    "#cc33ff": "Violet",
    "#ffcc99": "Peach",
    "#99ffcc": "Seafoam",
    "#cc99ff": "Light Purple",
    "#33cc33": "Emerald",
    "#ff3366": "Rose",
    "#66ff33": "Bright Green",
    "#33cccc": "Teal"
};

export const PHONEME_MESSAGES: { [key: string]: string } = {
    "B": "A fresh red apple that recently fell from the tree.",
    "P": "This apple has a beautiful crimson color.",
    "T": "A crisp, tart apple perfect for baking.",
    "D": "A dark red apple with a sweet taste.",
    "K": "A firm apple with a balanced flavor.",
    "G": "A green apple with a sour punch.",
    "F": "A flawless apple with shiny skin.",
    "V": "A perfectly ripe apple with a mix of red and yellow.",
    "S": "A small, sweet apple great for snacking.",
    "Z": "A zesty apple with bright flavor.",
    "SH": "A shiny apple with smooth skin.",
    "CH": "A chunky apple perfect for pies.",
    "J": "A juicy apple that drips when bitten.",
    "TH": "A thick-skinned apple that stores well.",
    "DH": "A delightfully tasty heritage variety.",
    "M": "A magnificent apple from a special tree.",
    "N": "A nutritious apple packed with vitamins.",
    "NG": "An elongated apple variety from distant orchards.",
    "L": "A large apple that takes two hands to hold.",
    "R": "A ruby-red apple with rich flavor.",
    "W": "A wonderful apple that tastes like honey.",
    "Y": "A yellow apple with a hint of sweetness.",
    "H": "A healthy apple grown without pesticides.",
    "Be": "A beautiful speckled apple variety."
};