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

      const entity = Object.keys(schemas).find(
        (schemaName) => schemaName.toLowerCase() === tag.toLowerCase()
      );

      if (["POST", "PUT", "PATCH"].includes(method) && entity) {

        const cleanSchema = removeInternalFields(schemas[entity]);

        requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: cleanSchema,
              example: generateExample(cleanSchema)
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
          201: {
            description: "Created successfully"
          },
          400: {
            description: "Bad request"
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

      } else if (prop.reference === "1:m" || prop.reference === "m:n") {

        properties[prop.name] = {
          type: "array",
          items: { type: "integer" },
          description: `Array of related ${prop.type}`
        };

      } else {

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



function removeInternalFields(schema: any) {

  const clean = JSON.parse(JSON.stringify(schema));

  delete clean.properties.id;
  delete clean.properties.createdAt;
  delete clean.properties.updatedAt;

  if (clean.required) {
    clean.required = clean.required.filter(
      (f: string) =>
        f !== "id" &&
        f !== "createdAt" &&
        f !== "updatedAt"
    );
  }

  return clean;
}



function generateExample(schema: any) {

  const example: any = {};

  Object.entries(schema.properties).forEach(([key, value]: any) => {

    const name = key.toLowerCase();

    if (name.includes("email")) example[key] = "usuario@email.com";
    else if (name.includes("username")) example[key] = "usuario123";
    else if (name.includes("password")) example[key] = "Ejemplo123456";
    else if (name.includes("name")) example[key] = "Juan";
    else if (name.includes("role")) example[key] = "admin";
    else if (name.includes("date")) example[key] = "2025-01-01";
    else if (value.type === "number") example[key] = 1;
    else if (value.type === "boolean") example[key] = true;
    else if (value.type === "array") example[key] = [];
    else example[key] = "example";

  });

  return example;
}