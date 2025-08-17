import { Model, Appareil } from "../models/Camera";
import { View } from "../views/CatalogueView";

export class Controller {
  private model = new Model();
  private view = new View("catalogue");
  private favorites = new Set<number>();
  private readonly FAVORITES_KEY = "luxecam:favorites";
  private fmtPrice = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format;

  async init() {
    this.loadFavorites();
    await this.model.loadData();

    this.safeApplyFiltersOrRenderAll();

    document.getElementById("form-ajout")?.addEventListener("submit", this.handleAdd);
    document.getElementById("form-modif")?.addEventListener("submit", this.handleModifSave);
    document.getElementById("modif-annuler")?.addEventListener("click", this.hideModifForm);

    document.getElementById("filtres")?.addEventListener("input", this.applyFilters);
    document.getElementById("filtres")?.addEventListener("change", this.applyFilters);

    document.getElementById("only-fav")?.addEventListener("change", this.applyFilters);
    this.updateFavCount();
  }

  private loadFavorites() {
    try {
      const raw = localStorage.getItem(this.FAVORITES_KEY);
      if (raw) this.favorites = new Set<number>(JSON.parse(raw));
    } catch {}
  }
  private saveFavorites() {
    try {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify([...this.favorites]));
    } catch {}
  }
  private updateFavCount = () => {
    const el = document.getElementById("fav-count");
    if (el) el.textContent = String(this.favorites.size);
  };

  private safeApplyFiltersOrRenderAll = () => {
    const hasAnyFilter =
      document.getElementById("q") ||
      document.getElementById("f-marque") ||
      document.getElementById("p-min") ||
      document.getElementById("p-max") ||
      document.getElementById("tri") ||
      document.getElementById("only-fav");

    if (hasAnyFilter) this.applyFilters();
    else
      this.view.renderAppareils(this.model.getAppareils(), this.handleEdit, {
        onDelete: this.handleDelete,
        onToggleFav: this.handleToggleFav,
        favorites: this.favorites,
        priceFormatter: this.fmtPrice,
      });
  };

  // ── CRUD ────────────────────────────────────────────────────────
  private handleAdd = (e: Event) => {
    e.preventDefault();

    const id = Date.now();
    const marque = (document.getElementById("marque") as HTMLSelectElement)?.value ?? "";
    const nomSaisi = (document.getElementById("nom") as HTMLInputElement)?.value ?? "";
    const nom = marque ? `${marque} ${nomSaisi}` : nomSaisi;

    const prix = Number((document.getElementById("prix") as HTMLInputElement)?.value ?? 0);
    let resolution = (document.getElementById("resolution") as HTMLInputElement)?.value ?? "";
    let iso = (document.getElementById("iso") as HTMLInputElement)?.value ?? "";
    let poids = (document.getElementById("poids") as HTMLInputElement)?.value ?? "";

    if (resolution && !/mp$/i.test(resolution)) resolution += " MP";
    if (iso && !/^iso\s/i.test(iso)) iso = "ISO " + iso;
    if (poids && !/g$/i.test(poids)) poids += " g";

    const nouvelAppareil: Appareil = {
      id,
      nom,
      prix,
      caracteristiques: {
        Marque: marque || "—",
        "Résolution": resolution,
        "ISO max": iso,
        "Poids": poids,
      },
    };

    this.model.addAppareil(nouvelAppareil);
    this.applyFilters();

    // reset du formulaire
    const form = e.target as HTMLFormElement | null;
    if (form) form.reset();
    const selectMarque = document.getElementById("marque") as HTMLSelectElement | null;
    if (selectMarque) selectMarque.selectedIndex = 0;
  };

  // ✅ Ouvre le <dialog> de modification avec focus
  private handleEdit = (id: number) => {
    const a = this.model.getAppareils().find((x) => x.id === id);
    if (!a) return;

    // Pré-remplir les champs
    (document.getElementById("modif-id") as HTMLInputElement).value = String(a.id);
    (document.getElementById("modif-nom") as HTMLInputElement).value = a.nom;
    (document.getElementById("modif-prix") as HTMLInputElement).value = String(a.prix);
    (document.getElementById("modif-resolution") as HTMLInputElement).value = a.caracteristiques["Résolution"] ?? "";
    (document.getElementById("modif-iso") as HTMLInputElement).value = a.caracteristiques["ISO max"] ?? "";
    (document.getElementById("modif-poids") as HTMLInputElement).value = a.caracteristiques["Poids"] ?? "";

    // Afficher la modale
    const dlg = document.getElementById("modification") as HTMLDialogElement | null;
    if (dlg) {
      (dlg as any).style.display = "block"; // compatibilité anciens styles/tests
      if ("showModal" in dlg) {
        try { dlg.showModal(); } catch { /* déjà ouverte */ }
      }
      // Focus sur le premier champ
      setTimeout(() => (document.getElementById("modif-nom") as HTMLInputElement)?.focus(), 0);
    }
  };

  private handleModifSave = (e: Event) => {
    e.preventDefault();

    const id = Number((document.getElementById("modif-id") as HTMLInputElement)?.value ?? 0);
    const nom = (document.getElementById("modif-nom") as HTMLInputElement)?.value ?? "";
    const prix = Number((document.getElementById("modif-prix") as HTMLInputElement)?.value ?? 0);
    const resolution = (document.getElementById("modif-resolution") as HTMLInputElement)?.value ?? "";
    const iso = (document.getElementById("modif-iso") as HTMLInputElement)?.value ?? "";
    const poids = (document.getElementById("modif-poids") as HTMLInputElement)?.value ?? "";

    const updated: Partial<Appareil> = {
      nom,
      prix,
      caracteristiques: {
        "Résolution": resolution,
        "ISO max": iso,
        "Poids": poids,
      },
    };

    this.model.updateAppareil(id, updated);
    this.applyFilters();
    this.hideModifForm();
  };

  private handleDelete = (id: number) => {
    if (!confirm("Supprimer cet appareil ?")) return;
    this.model.deleteAppareil(id);
    this.favorites.delete(id);
    this.saveFavorites();
    this.updateFavCount();
    this.applyFilters();
  };

  private handleToggleFav = (id: number) => {
    if (this.favorites.has(id)) this.favorites.delete(id);
    else this.favorites.add(id);
    this.saveFavorites();
    this.updateFavCount();
    this.applyFilters();
  };

  // ✅ Ferme proprement le <dialog>
  private hideModifForm = () => {
    const dlg = document.getElementById("modification") as HTMLDialogElement | null;
    if (dlg && "close" in dlg) dlg.close();
    if (dlg) (dlg as any).style.display = "none"; // compatibilité anciens styles/tests
  };

  // ── Filtres / Tri (+ Favoris) ───────────────────────────────────
  private applyFilters = () => {
    const q = (document.getElementById("q") as HTMLInputElement)?.value?.toLowerCase() || "";
    const marque = (document.getElementById("f-marque") as HTMLSelectElement)?.value || "";
    const pmin = Number((document.getElementById("p-min") as HTMLInputElement)?.value || 0);
    const pmax = Number((document.getElementById("p-max") as HTMLInputElement)?.value || Infinity);
    const tri = (document.getElementById("tri") as HTMLSelectElement)?.value || "";
    const onlyFav = (document.getElementById("only-fav") as HTMLInputElement)?.checked || false;

    const all = this.model.getAppareils();

    const getMarque = (a: Appareil) => a.caracteristiques["Marque"] || (a.nom.split(" ")[0] ?? "");
    const getResolutionMP = (a: Appareil) => {
      const raw = a.caracteristiques["Résolution"] || "";
      const m = raw.match(/(\d+(?:\.\d+)?)\s*mp/i);
      return m ? parseFloat(m[1]) : NaN;
    };

    let list = all.filter((a) => {
      const okQ = !q || a.nom.toLowerCase().includes(q);
      const okM = !marque || getMarque(a).toLowerCase() === marque.toLowerCase();
      const okP = a.prix >= pmin && a.prix <= pmax;
      return okQ && okM && okP;
    });

    if (onlyFav) list = list.filter((a) => this.favorites.has(a.id));

    if (tri === "prix-asc") list.sort((a, b) => a.prix - b.prix);
    if (tri === "prix-desc") list.sort((a, b) => b.prix - a.prix);
    if (tri === "res-asc") list.sort((a, b) => (getResolutionMP(a) || 0) - (getResolutionMP(b) || 0));
    if (tri === "res-desc") list.sort((a, b) => (getResolutionMP(b) || 0) - (getResolutionMP(a) || 0));

    this.view.renderAppareils(list, this.handleEdit, {
      onDelete: this.handleDelete,
      onToggleFav: this.handleToggleFav,
      favorites: this.favorites,
      priceFormatter: this.fmtPrice,
    });
  };
}

new Controller().init();
