export class View {
    constructor() {
        this.catalogue = document.getElementById("catalogue");
    }
    renderAppareils(appareils, onEdit) {
        this.catalogue.innerHTML = "";
        appareils.forEach(appareil => {
            const div = document.createElement("div");
            div.className = "appareil";
            div.innerHTML = `
        <h3>${appareil.nom}</h3>
        <p>Prix : ${appareil.prix} €</p>
        <ul>
          ${Object.entries(appareil.caracteristiques)
                .map(([k, v]) => `<li>${k} : ${v}</li>`)
                .join("")}
        </ul>
        <button data-id="${appareil.id}">Modifier</button>
      `;
            div.querySelector("button").addEventListener("click", () => onEdit(appareil.id));
            this.catalogue.appendChild(div);
        });
    }
}
