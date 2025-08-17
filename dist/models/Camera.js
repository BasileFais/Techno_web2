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
exports.Model = void 0;
class Model {
    constructor() {
        this.appareils = [];
    }
    loadData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("./data.json"); // 🔹 JSON externe
                if (!response.ok) {
                    throw new Error("Impossible de charger data.json");
                }
                this.appareils = yield response.json();
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
        });
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
exports.Model = Model;
