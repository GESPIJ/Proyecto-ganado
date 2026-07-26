import type { DataSource } from '../types';
import { usingLocal } from './client';
import { localDataSource } from './local';
import { httpDataSource } from './http';

export const dataSource: DataSource = usingLocal ? localDataSource : httpDataSource;
export { usingLocal } from './client';
