"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = void 0;
class View {
    constructor(containerId = "catalogue") {
        this.containerId = containerId;
    }
    renderAppareils(appareils, onEdit, opts = {}) {
        const root = document.getElementById(this.containerId);
        if (!root)
            return;
        root.innerHTML = "";
        appareils.forEach((a) => {
            var _a, _b, _c;
            const card = document.createElement("article");
            card.className = "appareil";
            const title = document.createElement("h3");
            title.textContent = a.nom;
            card.appendChild(title);
            const fmt = (_a = opts.priceFormatter) !== null && _a !== void 0 ? _a : ((v) => `${v} €`);
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
            const isFav = (_c = (_b = opts.favorites) === null || _b === void 0 ? void 0 : _b.has(a.id)) !== null && _c !== void 0 ? _c : false;
            if (isFav)
                card.classList.add("is-fav");
            // Favori
            const fav = document.createElement("button");
            fav.className = "fav-btn";
            fav.dataset.id = String(a.id);
            fav.setAttribute("aria-pressed", String(isFav));
            fav.textContent = isFav ? "★ Favori" : "☆ Favori";
            fav.addEventListener("click", () => { var _a; return (_a = opts.onToggleFav) === null || _a === void 0 ? void 0 : _a.call(opts, a.id); });
            actions.appendChild(fav);
            // Modifier
            const edit = document.createElement("button");
            edit.className = "edit-btn";
            edit.dataset.id = String(a.id);
            edit.textContent = "Modifier";
            edit.addEventListener("click", () => onEdit(a.id));
            actions.appendChild(edit);
            // Supprimer
            if (opts.onDelete) {
                const del = document.createElement("button");
                del.className = "delete-btn";
                del.dataset.id = String(a.id);
                del.textContent = "Supprimer";
                del.addEventListener("click", () => { var _a; return (_a = opts.onDelete) === null || _a === void 0 ? void 0 : _a.call(opts, a.id); });
                actions.appendChild(del);
            }
            card.appendChild(actions);
            root.appendChild(card);
        });
        if (appareils.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty";
            empty.textContent = "Aucun appareil ne correspond à vos critères.";
            root.appendChild(empty);
        }
    }
}
exports.View = View;
