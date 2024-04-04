import * as healthRepo from '@src/repos/health.repo';


export async function healthCheck(){
  await healthRepo.performHealthCheck();
}