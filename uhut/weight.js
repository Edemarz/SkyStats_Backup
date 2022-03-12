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
const userData = '';
module.exports = function (uhutweight) {
    return __awaiter(this, void 0, void 0, function* () {
        function zomb() {
            if (userData['slayers'].revenant > 2500000) {
                const zombie1 = 750;
                return zombie1;
            }
            else if (userData['slayers'].revenant > 1000000) {
                const zombie1 = ((userData['slayers'].revenant - 1000000) / 10000) + (userData['slayers'].revenant / 6000) * 1.36;
                return zombie1;
            }
            else {
                const zombie1 = (userData['slayers'].revenant / 6000) * 1.21;
                return zombie1;
            }
        }
        function tar() {
            if (userData['slayers'].tarantula > 1000000) {
                const tara1 = ((userData['slayers'].tarantula - 1000000) / 1650) + (userData['slayers'].tarantula / 1150) * 1.23;
                return tara1;
            }
            else {
                const tara1 = (userData['slayers'].tarantula / 1150) * 1.17;
                return tara1;
            }
        }
        function wolf() {
            if (userData['slayers'].sven > 1000000) {
                const sven1 = ((userData['slayers'].sven - 1000000) / 1500) + (userData['slayers'].sven / 1200) * 1.26;
                return sven1;
            }
            else {
                const sven1 = (userData['slayers'].sven / 1200) * 1.16;
                return sven1;
            }
        }
        function enderman() {
            if (userData['slayers'].voidgloom > 1000000) {
                const eman1 = ((userData['slayers'].voidgloom - 1000000) / 1500) + (userData['slayers'].voidgloom / 1000) * 1.42;
                return eman1;
            }
            else {
                const eman1 = (userData['slayers'].voidgloom / 1000) * 1.27;
                return eman1;
            }
        }
        function combatxp() {
            if (userData['skills'].combData > 55172425) {
                let combat2 = ((userData['slayers'].combData - 55172425) / 125000) + (55172425 / 110000) * 1.35;
                return combat2;
            }
            else {
                let combat2 = (userData['slayers'].combData / 150000) * 1.21;
                return combat2;
            }
        }
        return combatxp() + enderman() + wolf() + tar() + zomb();
    });
};
