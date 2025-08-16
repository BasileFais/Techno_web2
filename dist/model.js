export class Model {
    constructor() {
        this.appareils = [];
    }
    async loadData() {
        try {
            const response = await fetch("./data.json"); // 🔹 JSON externe
            if (!response.ok) {
                throw new Error("Impossible de charger data.json");
            }
            this.appareils = await response.json();
        }
        catch (error) {
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
    getAppareils() {
        return this.appareils;
    }
    addAppareil(appareil) {
        this.appareils.push(appareil);
    }
    updateAppareil(id, updated) {
        const appareil = this.appareils.find(a => a.id === id);
        if (appareil) {
            Object.assign(appareil, updated);
        }
    }
    deleteAppareil(id) {
        this.appareils = this.appareils.filter(a => a.id !== id);
    }
}
