/** @jest-environment jsdom */

// Mock du Model
jest.mock("../src/models/Camera", () => {
  class MockModel {
    private _data: any[] = [{ id: 1, nom: "A", prix: 100, caracteristiques: {} }];
    loadData = jest.fn(async () => {});
    getAppareils = jest.fn(() => this._data);
    addAppareil = jest.fn((a: any) => this._data.push(a));
    updateAppareil = jest.fn((id: number, updated: any) => {
      const item = this._data.find((x) => x.id === id);
      if (item) Object.assign(item, updated);
    });
  }
  return { Model: MockModel };
});

// Mock de la View
const renderSpy = jest.fn();
jest.mock("../src/views/CatalogueView", () => {
  class MockView {
    constructor(private containerId: string = "catalogue") {}
    renderAppareils = renderSpy;
  }
  return { View: MockView };
});

import { Controller } from "../src/controllers/Controller";

describe("Controller", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="catalogue"></div>

      <form id="form-ajout">
        <input id="nom" value="Canon R10"/>
        <input id="prix" value="999"/>
        <input id="resolution" value="24"/>
        <input id="iso" value="51200"/>
        <input id="poids" value="500"/>
        <button type="submit">Ajouter</button>
      </form>

      <div id="modification" style="display:none;">
        <form id="form-modif">
          <input id="modif-id" value="1"/>
          <input id="modif-nom" value="Nom MAJ"/>
          <input id="modif-prix" value="1234"/>
          <input id="modif-resolution" value="45 MP"/>
          <input id="modif-iso" value="ISO 102400"/>
          <input id="modif-poids" value="700 g"/>
          <button type="submit">Modifier</button>
        </form>
        <button id="modif-annuler" type="button">Annuler</button>
      </div>
    `;
    renderSpy.mockClear();
  });

  test("init() charge et rend", async () => {
    const controller = new Controller();
    await controller.init();

    expect(renderSpy).toHaveBeenCalledTimes(1);
    const [dataArg, onEditArg] = renderSpy.mock.calls[0];
    expect(Array.isArray(dataArg)).toBe(true);
    expect(typeof onEditArg).toBe("function");
  });

  test("submit #form-ajout -> re-render", async () => {
    const controller = new Controller();
    await controller.init();

    const formAjout = document.getElementById("form-ajout") as HTMLFormElement;
    formAjout.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  test("submit #form-modif -> re-render", async () => {
    const controller = new Controller();
    await controller.init();

    (document.getElementById("modification") as HTMLElement).style.display = "block";
    const formModif = document.getElementById("form-modif") as HTMLFormElement;
    formModif.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  test("bouton Annuler -> cache le formulaire", async () => {
    const controller = new Controller();
    await controller.init();

    const bloc = document.getElementById("modification") as HTMLElement;
    bloc.style.display = "block";
    (document.getElementById("modif-annuler") as HTMLButtonElement).click();

    expect(bloc.style.display).toBe("none");
  });
});
