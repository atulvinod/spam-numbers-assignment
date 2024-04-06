import supertest, { Test } from "supertest";
import TestAgent from "supertest/lib/agent";
import app from "@src/server";

export function getAgent(): TestAgent<Test> {
    return supertest.agent(app);
}
