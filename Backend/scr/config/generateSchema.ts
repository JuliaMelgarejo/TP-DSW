import listEndpoints from "express-list-endpoints";
import { orm } from "../zshare/db/orm.js";

export function generateOpenApi(app: any) {

  const endpoints = listEndpoints(app);
  const paths: any = {};
  const schemas: any = generateSchemas();

  endpoints.forEach((endpoint) => {

    const tag = endpoint.path.split("/")[2] || "General";

    endpoint.methods.forEach((method: string) => {

      const path = endpoint.path.replace(/:([a-zA-Z]+)/g, '{$1}');

      const params: any[] = [];

      const matches = endpoint.path.match(/:([a-zA-Z]+)/g);

      if (matches) {
        matches.forEach((p: string) => {
          params.push({
            name: p.replace(":", ""),
            in: "path",
            required: true,
            schema: { type: "string" }
          });
        });
      }

      if (!paths[path]) paths[path] = {};

      let requestBody;

      // Detectar automáticamente la entidad relacionada al endpoint
      const entity = Object.keys(schemas).find(
        (schemaName) => schemaName.toLowerCase() === tag.toLowerCase()
      );

      if (["POST", "PUT", "PATCH"].includes(method) && entity) {

        requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${entity}`
              },
              example: generateExample(schemas[entity])
            }
          }
        };

      }

      paths[path][method.toLowerCase()] = {
        tags: [tag],
        summary: `${method} ${endpoint.path}`,
        parameters: params,
        requestBody,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Successful response"
          },
          401: {
            description: "Unauthorized"
          },
          404: {
            description: "Not found"
          }
        }
      };

    });

  });

  return {
    openapi: "3.0.0",
    info: {
      title: "Refugio API",
      version: "1.0.0",
      description: "Documentación automática de la API"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ],
    components: {
      schemas,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    paths
  };
}



function generateSchemas() {

  const schemas: any = {};
  const metadata = orm.getMetadata().getAll();

  for (const meta of Object.values(metadata)) {

    const properties: any = {};
    const required: string[] = [];

    Object.values(meta.properties).forEach((prop: any) => {

      let type = "string";

      if (prop.type === "number") type = "number";
      if (prop.type === "boolean") type = "boolean";
      if (prop.type === "Date") type = "string";

      if (prop.reference === "m:1" || prop.reference === "1:1") {
        properties[prop.name] = {
          type: "integer",
          description: `ID of related ${prop.type}`
        };
      }
      else if (prop.reference === "1:m" || prop.reference === "m:n") {
        properties[prop.name] = {
          type: "array",
          items: {
            type: "integer"
          }
        };
      }
      else {
        properties[prop.name] = {
          type,
          description: prop.name
        };
      }

      if (!prop.nullable && prop.name !== "id") {
        required.push(prop.name);
      }

    });

    schemas[meta.className] = {
      type: "object",
      required,
      properties
    };

  }

  return schemas;
}



function generateExample(schema: any) {

  const example: any = {};

  Object.entries(schema.properties).forEach(([key, value]: any) => {

    if (value.type === "string") example[key] = "string";
    else if (value.type === "number") example[key] = 0;
    else if (value.type === "boolean") example[key] = true;
    else if (value.type === "array") example[key] = [];
    else example[key] = null;

  });

  return example;
}