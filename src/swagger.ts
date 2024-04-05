import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "v1.0.0",
        title: "Spam number search API",
        description: "Spam number search project",
    },
    servers: [
        {
            url: "http://localhost:3000/api/v1",
            description: "API",
        },
    ],
    components: {
        examples: {
            login: {
                email: "atulvinod1911@gmail.com",
                password: "mypassword",
            },
        },
        schemas: {
            login: {
                $email: "email",
                $password: "password",
            },
            createUser: {
                $email: "email",
                $name: "name",
                $password: "password",
                $phoneNumber: "phoneNumber",
                $countryCode: "countryCode",
            },
            spamRequest: {
                $phoneNumber: "phoneNumber",
                $countryCode: "Countrycode",
                $name: "name",
            },
        },
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
            },
        },
    },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/*.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
