import { Logger } from "@nestjs/common";
export abstract class Instrumentation {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  protected info(message: string, logObj: object = {}) {
    this.logger.log(logObj, message);
  }

  protected debug(message: string, logObj: object = {}) {
    this.logger.debug(logObj, message);
  }

  protected warn(message: string, logObj: object = {}) {
    this.logger.warn(logObj, message);
  }

  protected error(message: string, logObj: object = {}) {
    this.logger.error(logObj, message);
  }
}
