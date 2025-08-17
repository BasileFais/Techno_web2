import { Model, Appareil } from "../src/models/Camera";

describe("Model", () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
    // @ts-ignore
    global.fetch = undefined;
  });

  test("loadData charge depuis data.json quand fetch OK", async () => {
    const fakeData: Appareil[] = [
      { id: 10, nom: "Sony A7 IV", prix: 2499, caracteristiques: { "Résolution": "33 MP" } },
      { id: 11, nom: "Fujifilm X-T5", prix: 1899, caracteristiques: { "Résolution": "40 MP" } },
    ];
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => fakeData });

    await model.loadData();
    expect(model.getAppareils()).toEqual(fakeData);
    // @ts-ignore
    expect(global.fetch).toHaveBeenCalledWith("./data.json");
  });

  test("loadData utilise defaults si fetch échoue", async () => {
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await model.loadData();
    const list = model.getAppareils();

    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty("nom");
    expect(list[0]).toHaveProperty("prix");
  });

  test("add / update / delete", () => {
    const a: Appareil = { id: 1, nom: "Canon EOS R10", prix: 999, caracteristiques: {} };
    model.addAppareil(a);
    expect(model.getAppareils()).toContainEqual(a);

    model.updateAppareil(1, { prix: 1099, nom: "Canon EOS R10 (MAJ)" });
    const updated = model.getAppareils().find(x => x.id === 1)!;
    expect(updated.prix).toBe(1099);
    expect(updated.nom).toBe("Canon EOS R10 (MAJ)");

    model.deleteAppareil(1);
    expect(model.getAppareils().find(x => x.id === 1)).toBeUndefined();
  });
});
