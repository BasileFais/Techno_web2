"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const Camera_1 = require("../models/Camera");
const CatalogueView_1 = require("../views/CatalogueView");
class Controller {
    constructor() {
        this.model = new Camera_1.Model();
        this.view = new CatalogueView_1.View("catalogue");
        this.favorites = new Set();
        this.FAVORITES_KEY = "luxecam:favorites";
        this.fmtPrice = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format;
        this.updateFavCount = () => {
            const el = document.getElementById("fav-count");
            if (el)
                el.textContent = String(this.favorites.size);
        };
        this.safeApplyFiltersOrRenderAll = () => {
            const hasAnyFilter = document.getElementById("q") ||
                document.getElementById("f-marque") ||
                document.getElementById("p-min") ||
                document.getElementById("p-max") ||
                document.getElementById("tri") ||
                document.getElementById("only-fav");
            if (hasAnyFilter)
                this.applyFilters();
            else
                this.view.renderAppareils(this.model.getAppareils(), this.handleEdit, {
                    onDelete: this.handleDelete,
                    onToggleFav: this.handleToggleFav,
                    favorites: this.favorites,
                    priceFormatter: this.fmtPrice,
                });
        };
        // ── CRUD ────────────────────────────────────────────────────────
        this.handleAdd = (e) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            e.preventDefault();
            const id = Date.now();
            const marque = (_b = (_a = document.getElementById("marque")) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "";
            const nomSaisi = (_d = (_c = document.getElementById("nom")) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : "";
            const nom = marque ? `${marque} ${nomSaisi}` : nomSaisi;
            const prix = Number((_f = (_e = document.getElementById("prix")) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : 0);
            let resolution = (_h = (_g = document.getElementById("resolution")) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : "";
            let iso = (_k = (_j = document.getElementById("iso")) === null || _j === void 0 ? void 0 : _j.value) !== null && _k !== void 0 ? _k : "";
            let poids = (_m = (_l = document.getElementById("poids")) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : "";
            if (resolution && !/mp$/i.test(resolution))
                resolution += " MP";
            if (iso && !/^iso\s/i.test(iso))
                iso = "ISO " + iso;
            if (poids && !/g$/i.test(poids))
                poids += " g";
            const nouvelAppareil = {
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
            const form = e.target;
            if (form)
                form.reset();
            const selectMarque = document.getElementById("marque");
            if (selectMarque)
                selectMarque.selectedIndex = 0;
        };
        // ✅ Ouvre le <dialog> de modification avec focus
        this.handleEdit = (id) => {
            var _a, _b, _c;
            const a = this.model.getAppareils().find((x) => x.id === id);
            if (!a)
                return;
            // Pré-remplir les champs
            document.getElementById("modif-id").value = String(a.id);
            document.getElementById("modif-nom").value = a.nom;
            document.getElementById("modif-prix").value = String(a.prix);
            document.getElementById("modif-resolution").value = (_a = a.caracteristiques["Résolution"]) !== null && _a !== void 0 ? _a : "";
            document.getElementById("modif-iso").value = (_b = a.caracteristiques["ISO max"]) !== null && _b !== void 0 ? _b : "";
            document.getElementById("modif-poids").value = (_c = a.caracteristiques["Poids"]) !== null && _c !== void 0 ? _c : "";
            // Afficher la modale
            const dlg = document.getElementById("modification");
            if (dlg) {
                dlg.style.display = "block"; // compatibilité anciens styles/tests
                if ("showModal" in dlg) {
                    try {
                        dlg.showModal();
                    }
                    catch ( /* déjà ouverte */_d) { /* déjà ouverte */ }
                }
                // Focus sur le premier champ
                setTimeout(() => { var _a; return (_a = document.getElementById("modif-nom")) === null || _a === void 0 ? void 0 : _a.focus(); }, 0);
            }
        };
        this.handleModifSave = (e) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            e.preventDefault();
            const id = Number((_b = (_a = document.getElementById("modif-id")) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0);
            const nom = (_d = (_c = document.getElementById("modif-nom")) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : "";
            const prix = Number((_f = (_e = document.getElementById("modif-prix")) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : 0);
            const resolution = (_h = (_g = document.getElementById("modif-resolution")) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : "";
            const iso = (_k = (_j = document.getElementById("modif-iso")) === null || _j === void 0 ? void 0 : _j.value) !== null && _k !== void 0 ? _k : "";
            const poids = (_m = (_l = document.getElementById("modif-poids")) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : "";
            const updated = {
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
        this.handleDelete = (id) => {
            if (!confirm("Supprimer cet appareil ?"))
                return;
            this.model.deleteAppareil(id);
            this.favorites.delete(id);
            this.saveFavorites();
            this.updateFavCount();
            this.applyFilters();
        };
        this.handleToggleFav = (id) => {
            if (this.favorites.has(id))
                this.favorites.delete(id);
            else
                this.favorites.add(id);
            this.saveFavorites();
            this.updateFavCount();
            this.applyFilters();
        };
        // ✅ Ferme proprement le <dialog>
        this.hideModifForm = () => {
            const dlg = document.getElementById("modification");
            if (dlg && "close" in dlg)
                dlg.close();
            if (dlg)
                dlg.style.display = "none"; // compatibilité anciens styles/tests
        };
        // ── Filtres / Tri (+ Favoris) ───────────────────────────────────
        this.applyFilters = () => {
            var _a, _b, _c, _d, _e, _f, _g;
            const q = ((_b = (_a = document.getElementById("q")) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || "";
            const marque = ((_c = document.getElementById("f-marque")) === null || _c === void 0 ? void 0 : _c.value) || "";
            const pmin = Number(((_d = document.getElementById("p-min")) === null || _d === void 0 ? void 0 : _d.value) || 0);
            const pmax = Number(((_e = document.getElementById("p-max")) === null || _e === void 0 ? void 0 : _e.value) || Infinity);
            const tri = ((_f = document.getElementById("tri")) === null || _f === void 0 ? void 0 : _f.value) || "";
            const onlyFav = ((_g = document.getElementById("only-fav")) === null || _g === void 0 ? void 0 : _g.checked) || false;
            const all = this.model.getAppareils();
            const getMarque = (a) => { var _a; return a.caracteristiques["Marque"] || ((_a = a.nom.split(" ")[0]) !== null && _a !== void 0 ? _a : ""); };
            const getResolutionMP = (a) => {
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
            if (onlyFav)
                list = list.filter((a) => this.favorites.has(a.id));
            if (tri === "prix-asc")
                list.sort((a, b) => a.prix - b.prix);
            if (tri === "prix-desc")
                list.sort((a, b) => b.prix - a.prix);
            if (tri === "res-asc")
                list.sort((a, b) => (getResolutionMP(a) || 0) - (getResolutionMP(b) || 0));
            if (tri === "res-desc")
                list.sort((a, b) => (getResolutionMP(b) || 0) - (getResolutionMP(a) || 0));
            this.view.renderAppareils(list, this.handleEdit, {
                onDelete: this.handleDelete,
                onToggleFav: this.handleToggleFav,
                favorites: this.favorites,
                priceFormatter: this.fmtPrice,
            });
        };
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            this.loadFavorites();
            yield this.model.loadData();
            this.safeApplyFiltersOrRenderAll();
            (_a = document.getElementById("form-ajout")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", this.handleAdd);
            (_b = document.getElementById("form-modif")) === null || _b === void 0 ? void 0 : _b.addEventListener("submit", this.handleModifSave);
            (_c = document.getElementById("modif-annuler")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", this.hideModifForm);
            (_d = document.getElementById("filtres")) === null || _d === void 0 ? void 0 : _d.addEventListener("input", this.applyFilters);
            (_e = document.getElementById("filtres")) === null || _e === void 0 ? void 0 : _e.addEventListener("change", this.applyFilters);
            (_f = document.getElementById("only-fav")) === null || _f === void 0 ? void 0 : _f.addEventListener("change", this.applyFilters);
            this.updateFavCount();
        });
    }
    loadFavorites() {
        try {
            const raw = localStorage.getItem(this.FAVORITES_KEY);
            if (raw)
                this.favorites = new Set(JSON.parse(raw));
        }
        catch (_a) { }
    }
    saveFavorites() {
        try {
            localStorage.setItem(this.FAVORITES_KEY, JSON.stringify([...this.favorites]));
        }
        catch (_a) { }
    }
}
exports.Controller = Controller;
new Controller().init();
