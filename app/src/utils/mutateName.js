// Instead of this:
// import { unidecode } from 'unidecode';

// Do this:
import unidecode from 'unidecode'; // default import

export const mutateName = (name) => {
  if (name === "HAGENES Per Strand") return "per-strand-hagenes";
  if (name === "AYUSO Juan") return "juan-ayuso-pesquera";
  if (name === "OLIVEIRA Ivo") return "ivo-emanuel-alves";
  if (name === "HONORÉ Mikkel Frølich") return "mikkel-honore";

  // Remove accents (normalize)
  name = unidecode(name);

  const parts = name.split(" ");
  const newName = [parts[parts.length - 1], ...parts.slice(0, -1)]
    .join("-")
    .toLowerCase();

  return newName;
};
