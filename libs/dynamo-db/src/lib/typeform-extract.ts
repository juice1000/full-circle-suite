import { User, Child } from './db-types';
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
      ref: field.ref,
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

  console.log('evaluationArray', evaluationArray);
  console.log('qaArray', qaArray);

  // TODO: these fields are sensitive to the form used and won't function with another form without modification
  // const firstNameField = qaArray.find((qa) => qa.id === 'cycC1n2TmlnU');
  // const roleField = qaArray.find((qa) => qa.id === '8QkRAFm3vff2');
  // const parentingConcerns = qaArray.find((qa) => qa.id === '8xeA5FgsrOLC');
  const firstNameField = qaArray.find((qa) => qa.id === 'RMuK1snn8jz7');
  const roleField = qaArray.find((qa) => qa.id === 'BotXRIB1uqMF');
  const parentingConcerns = qaArray.find((qa) => qa.id === 't2R2WzkcDfBd');
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

  // We extract the names
  const extractedBabies = extractBabies(qaArray);

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

    children: extractedBabies,

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

function extractBabies(qaArray: any): Child[] {
  const babyRegex = new RegExp('first name', 'i');
  const babies = qaArray.filter((qa) => qa.question.match(babyRegex));

  const extractedBabies = [];
  babies.forEach((baby) => {
    // We search for all fields that contain the reference in the question
    const ref = baby.ref;

    const babyFields = qaArray.filter((qa) => qa.question.includes(ref));

    // We create a baby object that has all the referenced fields
    let babyObject;
    if (babyFields.length === 1) {
      babyObject = {
        name: baby.answer,
        birthdate: new Date(),
        sensitivity: babyFields[0].answer,
      };
      babyObject.birthdate.setFullYear(babyObject.birthdate.getFullYear() - 1);
    } else {
      babyObject = {
        name: baby.answer,
        birthdate: new Date(babyFields[0].answer),
        sensitivity: babyFields[1].answer,
      };
    }
    extractedBabies.push(babyObject);
  });
  return extractedBabies;
}

function getArchetypePrompt(archeType: string, userName: string): string {
  const archetypePrompt = `The following describes the archetype of the ${userName}: `;
  if (archeType === 'hard-working') {
    return '';
  } else if (archeType === 'mindful-mentor') {
    return (
      archetypePrompt +
      'The Mindful Mentor: Respond in a way that prioritises mindful parenting and developing emotional intelligence.'
    );
  } else if (archeType === 'Time-Strapped Inquirer') {
    return (
      archetypePrompt +
      'The Time-Strapped Inquirer: “Respond in a way that prioritises time-saving parenting tips.'
    );
  } else if (archeType === 'The Traditionalist Explorer') {
    return (
      archetypePrompt +
      "The Traditionalist Explorer: “Respond in a way that xyz (haven't figured it out exactly)."
    );
  } else {
    return '';
  }
}

function craftUserIntroduction(user: User) {
  let childSensitivityExplanation = `${user.firstname} has ${user.numberOfChildren} children. They will be introduced in the following paragraph:\n`;
  user.children.forEach((child) => {
    childSensitivityExplanation += `${
      child.name
    } was born on ${child.birthdate.toDateString()}. `;
  });
  childSensitivityExplanation += `Next, we evaluate their sensitivity levels towards lights, sounds & textures on a scale of 1-5 (1 being the least sensitive and 5 being the most sensitive):\n`;
  user.children.forEach((child) => {
    childSensitivityExplanation += `${child.name}'s sensitivity level is at ${child.sensitivity}. `;
  });

  let userIntroduction = `The user's name is ${user.firstname}. The user is a ${user.role} to ${user.numberOfChildren} children.\n`;
  userIntroduction += getArchetypePrompt(user.archeType, user.firstname);
  userIntroduction += childSensitivityExplanation;
  return userIntroduction;
}

function craftInitialIntroduction(user: User) {
  const userStressScoreExplanation = `The user's stress level score is on a scale of 1-5 (1 being the least stressed and 5 being the most stressed) at ${user.stressScore}.`;

  const initialIntroduction =
    user.introduction +
    `${userStressScoreExplanation} Their current parenting concerns are: ${user.parentingConcerns}.`;

  return initialIntroduction;
}
