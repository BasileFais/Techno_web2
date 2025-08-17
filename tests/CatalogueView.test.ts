/** @jest-environment jsdom */

import { View } from "../src/views/CatalogueView";
import { Appareil } from "../src/models/Camera";

describe("CatalogueView", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="liste"></div>`;
  });

  test("renderAppareils rend et appelle onEdit", () => {
    const v = new View("liste"); // 👈 conteneur test
    const appareils: Appareil[] = [
      { id: 1, nom: "Canon R5", prix: 3500, caracteristiques: { "Résolution": "45 MP" } },
      { id: 2, nom: "Nikon Z6 II", prix: 2200, caracteristiques: { "ISO max": "204800" } },
    ];
    const onEdit = jest.fn();

    v.renderAppareils(appareils, onEdit);

    const html = document.body.innerHTML;
    expect(html).toContain("Canon R5");
    expect(html).toContain("3500");
    expect(html).toContain("Nikon Z6 II");

    const btn = document.querySelector('.edit-btn[data-id="1"]') as HTMLElement;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onEdit).toHaveBeenCalledWith(1);
  });
});
