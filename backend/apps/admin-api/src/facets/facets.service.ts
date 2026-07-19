import { Injectable } from '@nestjs/common';

@Injectable()
export class FacetsService {
  findAllGroups(): null {
    return null;
  }

  createGroup(_body: Record<string, unknown>): null {
    return null;
  }

  updateGroup(_id: string, _body: Record<string, unknown>): null {
    return null;
  }

  removeGroup(_id: string): null {
    return null;
  }

  findAllValues(): null {
    return null;
  }

  createValue(_body: Record<string, unknown>): null {
    return null;
  }

  updateValue(_id: string, _body: Record<string, unknown>): null {
    return null;
  }

  removeValue(_id: string): null {
    return null;
  }

  findGroupValues(_id: string): null {
    return null;
  }

  addGroupValue(_id: string, _body: Record<string, unknown>): null {
    return null;
  }
}
