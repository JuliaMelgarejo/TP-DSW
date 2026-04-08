import { Selector } from 'testcafe';

fixture('Flujo de adopción').page('http://localhost:4200').beforeEach(async t => { await t.setNativeDialogHandler(() => true); });;

test('Usuario puede crear una adopción', async t => {

  const userInput = Selector('input[type="text"]');
  const passwordInput = Selector('input[type="password"]');
  const loginButton = Selector('button').withText('Aceptar');
  await t.typeText(userInput, 'pruebauser').typeText(passwordInput, 'pruebauser').click(loginButton);

  const adoptSectionButton = Selector('a').withText('Ver animales');
  await t.click(adoptSectionButton);

  const firstAnimal = Selector('.animal-card').nth(0);
  await t.click(firstAnimal);

  const adoptButton = Selector('button').withText('Interesado en adoptar');
  await t.click(adoptButton);

  const commentsInput = Selector('textarea');
  await t.typeText(commentsInput, 'Quiero adoptarlo');

  const submitButton = Selector('button').withText('Enviar solicitud');
  await t.expect(submitButton.exists).ok({ timeout: 5000 });
  await t.click(submitButton);

  const successMessage = Selector('.alert.alert-success');
  await t.expect(successMessage.exists).ok().expect(successMessage.innerText).contains('Solicitud enviada');
});