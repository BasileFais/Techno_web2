// src/models/Camera.ts
var Model = class {
  constructor() {
    this.appareils = [];
  }
  async loadData() {
    try {
      const response = await fetch("./data.json");
      if (!response.ok) {
        throw new Error("Impossible de charger data.json");
      }
      this.appareils = await response.json();
    } catch (error) {
      console.error("\u26A0\uFE0F Erreur lors du chargement de data.json :", error);
      this.appareils = [
        {
          id: 1,
          nom: "Canon EOS R5",
          prix: 3500,
          caracteristiques: {
            "R\xE9solution": "45 MP",
            "ISO max": "51200",
            "Poids": "738 g"
          }
        },
        {
          id: 2,
          nom: "Nikon Z6 II",
          prix: 2200,
          caracteristiques: {
            "R\xE9solution": "24 MP",
            "ISO max": "204800",
            "Poids": "705 g"
          }
        }
      ];
    }
  }
  getAppareils() {
    return this.appareils;
  }
  addAppareil(appareil) {
    this.appareils.push(appareil);
  }
  updateAppareil(id, updated) {
    const appareil = this.appareils.find((a) => a.id === id);
    if (appareil) {
      Object.assign(appareil, updated);
    }
  }
  deleteAppareil(id) {
    this.appareils = this.appareils.filter((a) => a.id !== id);
  }
};

// src/views/CatalogueView.ts
var View = class {
  constructor(containerId = "catalogue") {
    this.containerId = containerId;
  }
  renderAppareils(appareils, onEdit, opts = {}) {
    const root = document.getElementById(this.containerId);
    if (!root) return;
    root.innerHTML = "";
    appareils.forEach((a) => {
      const card = document.createElement("article");
      card.className = "appareil";
      const title = document.createElement("h3");
      title.textContent = a.nom;
      card.appendChild(title);
      const fmt = opts.priceFormatter ?? ((v) => `${v} \u20AC`);
      const price = document.createElement("p");
      price.textContent = `Prix : ${fmt(a.prix)}`;
      card.appendChild(price);
      const ul = document.createElement("ul");
      for (const [k, v] of Object.entries(a.caracteristiques)) {
        const li = document.createElement("li");
        li.textContent = `${k} : ${v}`;
        ul.appendChild(li);
      }
      card.appendChild(ul);
      const actions = document.createElement("div");
      actions.className = "actions";
      const isFav = opts.favorites?.has(a.id) ?? false;
      if (isFav) card.classList.add("is-fav");
      const fav = document.createElement("button");
      fav.className = "fav-btn";
      fav.dataset.id = String(a.id);
      fav.setAttribute("aria-pressed", String(isFav));
      fav.textContent = isFav ? "\u2605 Favori" : "\u2606 Favori";
      fav.addEventListener("click", () => opts.onToggleFav?.(a.id));
      actions.appendChild(fav);
      const edit = document.createElement("button");
      edit.className = "edit-btn";
      edit.dataset.id = String(a.id);
      edit.textContent = "Modifier";
      edit.addEventListener("click", () => onEdit(a.id));
      actions.appendChild(edit);
      if (opts.onDelete) {
        const del = document.createElement("button");
        del.className = "delete-btn";
        del.dataset.id = String(a.id);
        del.textContent = "Supprimer";
        del.addEventListener("click", () => opts.onDelete?.(a.id));
        actions.appendChild(del);
      }
      card.appendChild(actions);
      root.appendChild(card);
    });
    if (appareils.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "Aucun appareil ne correspond \xE0 vos crit\xE8res.";
      root.appendChild(empty);
    }
  }
};

// src/controllers/Controller.ts
var Controller = class {
  constructor() {
    this.model = new Model();
    this.view = new View("catalogue");
    this.favorites = /* @__PURE__ */ new Set();
    this.FAVORITES_KEY = "luxecam:favorites";
    this.fmtPrice = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format;
    this.updateFavCount = () => {
      const el = document.getElementById("fav-count");
      if (el) el.textContent = String(this.favorites.size);
    };
    this.safeApplyFiltersOrRenderAll = () => {
      const hasAnyFilter = document.getElementById("q") || document.getElementById("f-marque") || document.getElementById("p-min") || document.getElementById("p-max") || document.getElementById("tri") || document.getElementById("only-fav");
      if (hasAnyFilter) this.applyFilters();
      else
        this.view.renderAppareils(this.model.getAppareils(), this.handleEdit, {
          onDelete: this.handleDelete,
          onToggleFav: this.handleToggleFav,
          favorites: this.favorites,
          priceFormatter: this.fmtPrice
        });
    };
    // ── CRUD ────────────────────────────────────────────────────────
    this.handleAdd = (e) => {
      e.preventDefault();
      const id = Date.now();
      const marque = document.getElementById("marque")?.value ?? "";
      const nomSaisi = document.getElementById("nom")?.value ?? "";
      const nom = marque ? `${marque} ${nomSaisi}` : nomSaisi;
      const prix = Number(document.getElementById("prix")?.value ?? 0);
      let resolution = document.getElementById("resolution")?.value ?? "";
      let iso = document.getElementById("iso")?.value ?? "";
      let poids = document.getElementById("poids")?.value ?? "";
      if (resolution && !/mp$/i.test(resolution)) resolution += " MP";
      if (iso && !/^iso\s/i.test(iso)) iso = "ISO " + iso;
      if (poids && !/g$/i.test(poids)) poids += " g";
      const nouvelAppareil = {
        id,
        nom,
        prix,
        caracteristiques: {
          Marque: marque || "\u2014",
          "R\xE9solution": resolution,
          "ISO max": iso,
          "Poids": poids
        }
      };
      this.model.addAppareil(nouvelAppareil);
      this.applyFilters();
      const form = e.target;
      if (form) form.reset();
      const selectMarque = document.getElementById("marque");
      if (selectMarque) selectMarque.selectedIndex = 0;
    };
    // ✅ Ouvre le <dialog> de modification avec focus
    this.handleEdit = (id) => {
      const a = this.model.getAppareils().find((x) => x.id === id);
      if (!a) return;
      document.getElementById("modif-id").value = String(a.id);
      document.getElementById("modif-nom").value = a.nom;
      document.getElementById("modif-prix").value = String(a.prix);
      document.getElementById("modif-resolution").value = a.caracteristiques["R\xE9solution"] ?? "";
      document.getElementById("modif-iso").value = a.caracteristiques["ISO max"] ?? "";
      document.getElementById("modif-poids").value = a.caracteristiques["Poids"] ?? "";
      const dlg = document.getElementById("modification");
      if (dlg) {
        dlg.style.display = "block";
        if ("showModal" in dlg) {
          try {
            dlg.showModal();
          } catch {
          }
        }
        setTimeout(() => document.getElementById("modif-nom")?.focus(), 0);
      }
    };
    this.handleModifSave = (e) => {
      e.preventDefault();
      const id = Number(document.getElementById("modif-id")?.value ?? 0);
      const nom = document.getElementById("modif-nom")?.value ?? "";
      const prix = Number(document.getElementById("modif-prix")?.value ?? 0);
      const resolution = document.getElementById("modif-resolution")?.value ?? "";
      const iso = document.getElementById("modif-iso")?.value ?? "";
      const poids = document.getElementById("modif-poids")?.value ?? "";
      const updated = {
        nom,
        prix,
        caracteristiques: {
          "R\xE9solution": resolution,
          "ISO max": iso,
          "Poids": poids
        }
      };
      this.model.updateAppareil(id, updated);
      this.applyFilters();
      this.hideModifForm();
    };
    this.handleDelete = (id) => {
      if (!confirm("Supprimer cet appareil ?")) return;
      this.model.deleteAppareil(id);
      this.favorites.delete(id);
      this.saveFavorites();
      this.updateFavCount();
      this.applyFilters();
    };
    this.handleToggleFav = (id) => {
      if (this.favorites.has(id)) this.favorites.delete(id);
      else this.favorites.add(id);
      this.saveFavorites();
      this.updateFavCount();
      this.applyFilters();
    };
    // ✅ Ferme proprement le <dialog>
    this.hideModifForm = () => {
      const dlg = document.getElementById("modification");
      if (dlg && "close" in dlg) dlg.close();
      if (dlg) dlg.style.display = "none";
    };
    // ── Filtres / Tri (+ Favoris) ───────────────────────────────────
    this.applyFilters = () => {
      const q = document.getElementById("q")?.value?.toLowerCase() || "";
      const marque = document.getElementById("f-marque")?.value || "";
      const pmin = Number(document.getElementById("p-min")?.value || 0);
      const pmax = Number(document.getElementById("p-max")?.value || Infinity);
      const tri = document.getElementById("tri")?.value || "";
      const onlyFav = document.getElementById("only-fav")?.checked || false;
      const all = this.model.getAppareils();
      const getMarque = (a) => a.caracteristiques["Marque"] || (a.nom.split(" ")[0] ?? "");
      const getResolutionMP = (a) => {
        const raw = a.caracteristiques["R\xE9solution"] || "";
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
        priceFormatter: this.fmtPrice
      });
    };
  }
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
  loadFavorites() {
    try {
      const raw = localStorage.getItem(this.FAVORITES_KEY);
      if (raw) this.favorites = new Set(JSON.parse(raw));
    } catch {
    }
  }
  saveFavorites() {
    try {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify([...this.favorites]));
    } catch {
    }
  }
};
new Controller().init();
export {
  Controller
};
