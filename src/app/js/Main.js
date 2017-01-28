import { Test } from "./Test.js";
import * as THREE from 'three'

export class Main extends Test{
    constructor(){
        super();
        console.log("inint main");
        this.s = 'test';
    }

}

document.addEventListener("DOMContentLoaded", ()=> {
    console.log(new Main(),new THREE.Vector2(), );

});