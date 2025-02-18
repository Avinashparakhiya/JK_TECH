import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IngestionService {
  constructor(private httpService: HttpService) {}

  async triggerIngestion(): Promise<void> {
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL + '/ingest';
    await this.httpService.post(pythonBackendUrl).toPromise();
  }
}