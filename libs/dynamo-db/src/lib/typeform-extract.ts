import { User } from './db-types';
import { v4 as uuidv4 } from 'uuid';

export function extractSignupUserInformation(formData: any) {
  const variables = formData.variables;
  const fields = formData.definition.fields;
  const answers = formData.answers;
  //   console.log(fields);
  // console.log(answers);

  // TODO: NEED TO INSERT FIELDS AND VARIABLES INTO THE DIFFERENT RESPONSES
  const qaArray = [];

  // FETCHES DATA FROM THE Q&A
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const id = fields[i].id;
    const answer = answers[i];
    const answerType = answer.type;
    let answerContent;
    if (answerType === 'choice') {
      answerContent = answer.choice.label;
    } else if (answerType === 'choices') {
      answerContent = answer.choices.labels.join(', ');
    } else if (answerType === 'text') {
      answerContent = answer.text;
    } else if (answerType === 'date') {
      answerContent = answer.date;
    } else if (answerType === 'number') {
      answerContent = answer.number;
    } else if (answerType === 'phone_number') {
      answerContent = answer.phone_number;
    } else if (answerType === 'email') {
      answerContent = answer.email;
    }
    const qa = {
      id: id,
      question: field.title,
      answer: answerContent,
    };
    qaArray.push(qa);
  }

  // FETCHES EVALUATED DATA FROM THE Q&A
  const evaluationArray = [];
  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    const variableType = variable.type;
    let variableContent;

    if (variableType === 'number') {
      variableContent = variable.number;
    } else if (variableType === 'text') {
      variableContent = variable.text;
    }

    const evaluation = {
      key: variable.key,
      value: variableContent,
    };
    evaluationArray.push(evaluation);
  }

  // console.log('evaluationArray', evaluationArray);
  // console.log('qaArray', qaArray);

  const firstNameField = qaArray.find((qa) => qa.id === 'cycC1n2TmlnU');
  const roleField = qaArray.find((qa) => qa.id === '8QkRAFm3vff2');
  const numberOfChildrenField = evaluationArray.find(
    (evaluation) => evaluation.key === 'numberofchildren'
  );
  const archetypeField = evaluationArray.find(
    (evaluation) => evaluation.key === 'archetype'
  );
  const phoneNumberField = answers.find(
    (answer) => answer.type === 'phone_number'
  );
  const phoneNumber = phoneNumberField.phone_number.replace('+', '');
  const emailField = answers.find((answer) => answer.type === 'email');
  const stressScore = evaluationArray.find(
    (evaluation) => evaluation.key === 'stressmanagement'
  );
  const parentingConcerns = qaArray.find((qa) => qa.id === '8xeA5FgsrOLC');

  const infantFirstNameField = qaArray.find((qa) => qa.id === '8RIU2RHce1CX');
  const infantBirtdateFiled = qaArray.find((qa) => qa.id === 'cy1fPamxv3pf');
  const infantCharacteristicsField = qaArray.find(
    (qa) => qa.id === 'ONzwl2CrfZnF'
  );
  // console.log('firstNameField', firstNameField.answer);
  // console.log('roleField', roleField.answer);
  // console.log('numberOfChildrenField', numberOfChildrenField.value);
  // console.log('archetypeField', archetypeField.value);
  // console.log('phoneNumber', phoneNumber);
  // console.log('emailField', emailField.email);
  // console.log('stressScore', stressScore.value);
  // console.log('parentingConcerns', parentingConcerns.answer);
  // console.log('infantFirstNameField', infantFirstNameField.answer);
  // console.log('infantBirtdateFiled', infantBirtdateFiled.answer);
  // console.log('infantCharacteristicsField', infantCharacteristicsField.answer);

  const user: User = {
    id: uuidv4(),
    firstname: firstNameField.answer,
    lastname: '',
    birthdate: null,
    role: roleField.answer,
    created: new Date(),
    archeType: archetypeField.value,
    phone: phoneNumber,
    email: emailField.email,
    numberOfChildren: numberOfChildrenField.value,
    stressScore: stressScore.value,
    parentingConcerns: parentingConcerns.answer,

    infantFirstName: infantFirstNameField.answer,
    infantBirtdate: infantBirtdateFiled.answer,
    infantCharacteristics: infantCharacteristicsField.answer,

    introduction: '',
    initialIntroduction: '',

    exerciseMode: false,
    exerciseName: '',
    exerciseStep: 0,
    exerciseLastParticipated: new Date(),
    subscriptionStartDate: new Date(),
    subscriptionEndDate: null,
  };

  user.introduction = craftUserIntroduction(user);
  user.initialIntroduction = craftInitialIntroduction(user);
  // console.log('new user', user);

  return user;
}

function craftUserIntroduction(user: User) {
  const childSensitivityExplanation = `${user.infantFirstName}'s sensitivity level towards lights, sounds & textures is on a scale of 1-5 (1 being the least sensitive and 5 being the most sensitive) at ${user.infantCharacteristics}`;

  const userIntroduction = `The user's name is ${user.firstname}. The user is a ${user.role} to ${user.numberOfChildren} children. ${user.firstname}'s parental archetype is a ${user.archeType}. The infant's name is ${user.infantFirstName} and was born this year. ${childSensitivityExplanation}`;

  return userIntroduction;
}

function craftInitialIntroduction(user: User) {
  const userStressScoreExplanation = `The user's stress level score is on a scale of 1-5 (1 being the least stressed and 5 being the most stressed) at ${user.stressScore}.`;

  const initialIntroduction =
    user.introduction +
    `${userStressScoreExplanation} Their current parenting concerns are: ${user.parentingConcerns}.`;

  return initialIntroduction;
}
