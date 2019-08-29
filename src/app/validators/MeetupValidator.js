import * as Yup from 'yup';

class MeetupValidator {
  constructor() {
    this.init();
  }

  init() {
    this.schema = Yup.object().shape({
      titulo: Yup.string().required(),
      descricao: Yup.string().required(),
      localizacao: Yup.string().required(),
      data_hora: Yup.date().required(),
      banner_id: Yup.number()
        .required()
        .integer(),
    });

    this.errors = [];
  }

  async validate(req) {
    try {
      await this.schema.validate(req.body, { abortEarly: false });
    } catch (e) {
      this.errors = e.errors;
      return false;
    }
    return true;
  }
}

export default MeetupValidator;
