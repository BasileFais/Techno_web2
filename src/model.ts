export interface Appareil {
  id: number;
  nom: string;
  prix: number;
  caracteristiques: {
    [key: string]: string;
  };
}

export class Model {
  private appareils: Appareil[] = [];

  async loadData(): Promise<void> {
    try {
      const response = await fetch("./data.json"); // 🔹 JSON externe
      if (!response.ok) {
        throw new Error("Impossible de charger data.json");
      }
      this.appareils = await response.json();
    } catch (error) {
      console.error("⚠️ Erreur lors du chargement de data.json :", error);
      // 🔹 Données par défaut si JSON introuvable
      this.appareils = [
        {
          id: 1,
          nom: "Canon EOS R5",
          prix: 3500,
          caracteristiques: {
            "Résolution": "45 MP",
            "ISO max": "51200",
            "Poids": "738 g"
          }
        },
        {
          id: 2,
          nom: "Nikon Z6 II",
          prix: 2200,
          caracteristiques: {
            "Résolution": "24 MP",
            "ISO max": "204800",
            "Poids": "705 g"
          }
        }
      ];
    }
  }

  getAppareils(): Appareil[] {
    return this.appareils;
  }

  addAppareil(appareil: Appareil): void {
    this.appareils.push(appareil);
  }

  updateAppareil(id: number, updated: Partial<Appareil>): void {
    const appareil = this.appareils.find(a => a.id === id);
    if (appareil) {
      Object.assign(appareil, updated);
    }
  }

  deleteAppareil(id: number): void {
    this.appareils = this.appareils.filter(a => a.id !== id);
  }
}
