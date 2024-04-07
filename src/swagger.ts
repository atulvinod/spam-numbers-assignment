import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "v1.0.0",
        title: "Spam number search API",
        description: "Spam number search project",
    },
    servers: [
        {
            url: "v1",
            description: "v1 API",
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
                $countryCode: "countryCode",
                $phoneNumber: "phoneNumber",
                $password: "password",
            },
            createRegUser: {
                email: "email",
                $name: "name",
                $password: "password",
                $phoneNumber: "phoneNumber",
                $countryCode: "countryCode",
            },
            createUser: {
                $name: "name",
                $phoneNumber: "phoneNumber",
                $countryCode: "countryCode",
                $contactOfUserId: "contactOfUserId",
                email: "email",
            },
            spamRequest: {
                $phoneNumber: "phoneNumber",
                $countryCode: "Countrycode",
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
