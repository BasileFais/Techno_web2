import { Model, Appareil } from "./model.js";
import { View } from "./view.js";

class Controller {
  private model = new Model();
  private view = new View();

  async init() {
    await this.model.loadData();
    this.view.renderAppareils(this.model.getAppareils(), this.handleEdit.bind(this));

    const form = document.getElementById("form-ajout") as HTMLFormElement;
    form.addEventListener("submit", (e) => this.handleAdd(e));

    const formModif = document.getElementById("form-modif") as HTMLFormElement;
    formModif.addEventListener("submit", (e) => this.handleModifSave(e));

    const btnAnnuler = document.getElementById("modif-annuler") as HTMLButtonElement;
    btnAnnuler.addEventListener("click", () => this.hideModifForm());
  }

  handleAdd(e: Event) {
    e.preventDefault();
    const id = Date.now();
    const nom = (document.getElementById("nom") as HTMLInputElement).value;
    const prix = parseInt((document.getElementById("prix") as HTMLInputElement).value);
    let resolution = (document.getElementById("resolution") as HTMLInputElement).value;
    let iso = (document.getElementById("iso") as HTMLInputElement).value;
    let poids = (document.getElementById("poids") as HTMLInputElement).value;

    // Ajout automatique des unités
    if (resolution && !resolution.includes("MP")) resolution += " MP";
    if (iso && !iso.toUpperCase().includes("ISO")) iso = "ISO " + iso;
    if (poids && !poids.includes("g")) poids += " g";

    const nouvelAppareil: Appareil = {
      id,
      nom,
      prix,
      caracteristiques: {
        "Résolution": resolution,
        "ISO max": iso,
        "Poids": poids
      }
    };

    this.model.addAppareil(nouvelAppareil);
    this.view.renderAppareils(this.model.getAppareils(), this.handleEdit.bind(this));
  }

  handleEdit(id: number) {
    const appareil = this.model.getAppareils().find(a => a.id === id);
    if (!appareil) return;
    // Affiche le formulaire de modification et pré-remplit les champs
    (document.getElementById("modification") as HTMLElement).style.display = "block";
    (document.getElementById("modif-id") as HTMLInputElement).value = appareil.id.toString();
    (document.getElementById("modif-nom") as HTMLInputElement).value = appareil.nom;
    (document.getElementById("modif-prix") as HTMLInputElement).value = appareil.prix.toString();
    (document.getElementById("modif-resolution") as HTMLInputElement).value = appareil.caracteristiques["Résolution"] || "";
    (document.getElementById("modif-iso") as HTMLInputElement).value = appareil.caracteristiques["ISO max"] || "";
    (document.getElementById("modif-poids") as HTMLInputElement).value = appareil.caracteristiques["Poids"] || "";
  }

  handleModifSave(e: Event) {
    e.preventDefault();
    const id = parseInt((document.getElementById("modif-id") as HTMLInputElement).value);
    const nom = (document.getElementById("modif-nom") as HTMLInputElement).value;
    const prix = parseInt((document.getElementById("modif-prix") as HTMLInputElement).value);
    const resolution = (document.getElementById("modif-resolution") as HTMLInputElement).value;
    const iso = (document.getElementById("modif-iso") as HTMLInputElement).value;
    const poids = (document.getElementById("modif-poids") as HTMLInputElement).value;

    const updated: Partial<Appareil> = {
      nom,
      prix,
      caracteristiques: {
        "Résolution": resolution,
        "ISO max": iso,
        "Poids": poids
      }
    };
    this.model.updateAppareil(id, updated);
    this.view.renderAppareils(this.model.getAppareils(), this.handleEdit.bind(this));
    this.hideModifForm();
  }

  hideModifForm() {
    (document.getElementById("modification") as HTMLElement).style.display = "none";
  }
}

new Controller().init();
