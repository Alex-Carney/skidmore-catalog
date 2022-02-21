import * as request from "supertest";
import { Test } from "@nestjs/testing";

import { INestApplication } from "@nestjs/common";
import { RepositoryModule } from "../resolvers/repository/repository.module";
import { RepositoryService } from "../services/repository.service";

describe("Repositories", () => {
  let app: INestApplication;
  const repositoryService = {
    createRepositories: () => [],
    getRepositories: () => [],
  };


  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RepositoryModule]
    })
      .overrideProvider(RepositoryService)
      .useValue(repositoryService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/GET repository', () => {
    return request(app.getHttpServer())
      .get('/repositories')
      //.auth()
      .expect(200)
      .expect({
        data: repositoryService.getRepositories()
      })
  })

  afterAll(async () => {
    await app.close();
  })


});
