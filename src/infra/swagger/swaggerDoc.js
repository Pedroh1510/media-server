import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";
// import * as json from './swagger-output.json'  assert { type: "json" }

const loadJSON = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url)));

const json = loadJSON('./swagger-output.json');
export default class SwaggerDoc{
  static middleware(){
    return swaggerUi.serve
  }

  static doc(){
    return swaggerUi.setup(json,{explorer:true,swaggerOptions:{
      docExpansion:'node'
    }})
  }
}