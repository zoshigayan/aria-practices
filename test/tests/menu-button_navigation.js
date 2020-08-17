

const { ariaTest } = require('..');
const { By, Key } = require('selenium-webdriver');
const assertAttributeValues = require('../util/assertAttributeValues');
const assertAriaLabelledby = require('../util/assertAriaLabelledby');
const assertAriaControls = require('../util/assertAriaControls');
const assertAriaRoles = require('../util/assertAriaRoles');

const exampleFile = 'menu-button/menu-button-navigation.html';

const ex = {
  menubuttonSelector: '#ex1 button',
  menubuttonSelectors: ['#id-mb-about', '#id-mb-admissions', '#id-mb-academics'],
  menuSelectors: ['#id-menu-about', '#id-menu-admissions', '#id-menu-academics'],
  menuitemSelectors: ['#id-menu-about [role="menuitem"]', '#id-menu-admissions [role="menuitem"]', '#id-menu-academics [role="menuitem"]'],
  menuitemSelector: '#ex1 [role="menuitem"]',
  menuLength: [4, 6, 8],
  numMenuitems: 18
};

const checkFocus = function (t, selector, index) {
  return t.context.session.executeScript(function () {
    const [selector, index] = arguments;
    let items = document.querySelectorAll(selector);
    return items[index] === document.activeElement;
  }, selector, index);
};

const waitForUrlChange = async function (t) {
  await t.context.session.wait(() => {
    return t.context.session.getCurrentUrl().then(url => {
      return url != t.context.url;
    });
  }, t.context.waitTime, 'Timeout waiting for url to update');
};

const openMenu = async function (t, menubuttonSelector, menuSelector) {
  const expanded = await t.context.session
    .findElement(By.css(menubuttonSelector))
    .getAttribute('aria-expanded');

  if (expanded !== 'true') {
    await t.context.session
      .findElement(By.css(menubuttonSelector))
      .sendKeys(Key.ENTER);
  }

  return t.context.session.wait(async function () {
    return t.context.session.findElement(By.css(menuSelector)).isDisplayed();
  }, t.context.waitTime, 'Timeout waiting for menu to open after click');
};


// Attributes

ariaTest('"aria-haspopup" attribute on menu button', exampleFile, 'button-aria-haspopup', async (t) => {
    await assertAttributeValues(t, ex.menubuttonSelector, 'aria-haspopup', 'true');
});

ariaTest('"aria-controls" attribute on menu button', exampleFile, 'button-aria-controls', async (t) => {
    await assertAriaControls(t, ex.menubuttonSelector);
});

ariaTest.failing('"aria-expanded" attribute on menu button', exampleFile, 'button-aria-expanded', async (t) => {
});

ariaTest('role="menu" on ul element', exampleFile, 'menu-role', async (t) => {
    await assertAriaRoles(t, 'ex1', 'menu', 3, 'ul');
});

ariaTest('"aria-labelledby" on role="menu"', exampleFile, 'menu-aria-labelledby', async (t) => {
  for (let i = 0; i < ex.menuSelectors.length; i++) {
    await assertAriaLabelledby(t, ex.menuSelectors[i]);
  }
});

ariaTest('role="none" on li element', exampleFile, 'none-role', async (t) => {
    await assertAriaRoles(t, 'ex1', 'none', ex.numMenuitems, 'li');
});

ariaTest('role="menuitem" on a element', exampleFile, 'menuitem-role', async (t) => {
    await assertAriaRoles(t, 'ex1', 'menuitem', ex.numMenuitems, 'a');
});

ariaTest('tabindex="-1" on role="menuitem"', exampleFile, 'menuitem-tabindex', async (t) => {
    await assertAttributeValues(t, ex.menuitemSelector, 'tabindex', '-1');
});


// Keys

ariaTest('"enter" on menu button', exampleFile, 'button-down-arrow-or-space-or-enter', async (t) => {

  for (let i = 0; i < ex.menubuttonSelectors.length; i++) {
    await t.context.session
      .findElement(By.css(ex.menubuttonSelectors[i]))
      .sendKeys(Key.ENTER);

    t.true(
      await t.context.session.findElement(By.css(ex.menuSelectors[i])).isDisplayed(),
      'The popup should be displayed after sending button ENTER'
    );

    t.true(
      await checkFocus(t, ex.menuitemSelectors[i], 0),
      'Focus should be on first item after sending button ENTER'
    );
  }

});

ariaTest('"down arrow" on menu button', exampleFile, 'button-down-arrow-or-space-or-enter', async (t) => {

  for (let i = 0; i < ex.menubuttonSelectors.length; i++) {
    await t.context.session
      .findElement(By.css(ex.menubuttonSelectors[i]))
      .sendKeys(Key.ARROW_DOWN);

    t.true(
      await t.context.session.findElement(By.css(ex.menuSelectors[i])).isDisplayed(),
      'The popup should be displayed after sending button ARROW_DOWN'
    );

    t.true(
      await checkFocus(t, ex.menuitemSelectors[i], 0),
      'Focus should be on first item after sending button ARROW_DOWN'
    );
  }

});

ariaTest('"space" on menu button', exampleFile, 'button-down-arrow-or-space-or-enter', async (t) => {

  for (let i = 0; i < ex.menubuttonSelectors.length; i++) {
    await t.context.session
      .findElement(By.css(ex.menubuttonSelectors[i]))
      .sendKeys(' ');

    t.true(
      await t.context.session.findElement(By.css(ex.menuSelectors[i])).isDisplayed(),
      'The popup should be displayed after sending button SPACE'
    );

    t.true(
      await checkFocus(t, ex.menuitemSelectors[i], 0),
      'Focus should be on first item after sending button SPACE'
    );
  }

});

ariaTest('"up arrow" on menu button', exampleFile, 'button-up-arrow', async (t) => {

  for (let i = 0; i < ex.menubuttonSelectors.length; i++) {
    await t.context.session
      .findElement(By.css(ex.menubuttonSelectors[i]))
      .sendKeys(Key.ARROW_UP);

    t.true(
      await t.context.session.findElement(By.css(ex.menuSelectors[i])).isDisplayed(),
      'The popup should be displayed after sending button ARROW_UP'
    );

    t.true(
      await checkFocus(t, ex.menuitemSelectors[i], ex.menuLength[i]-1),
      'Focus should be on last item after sending button ARROW_UP'
    );
  }

});

ariaTest('"enter" on role="menuitem"', exampleFile, 'menu-enter', async (t) => {

  for (let i = 0; i < ex.menubuttonSelectors.length; i++) {
    for (let index = 0; index < ex.menuLength[i]; index++) {

      // Return to test page
      await t.context.session.get(t.context.url);
      const item = (await t.context.queryElements(t, ex.menuitemSelectors[i]))[index];

      await openMenu(t, ex.menubuttonSelectors[i], ex.menuSelectors[i]);
      await item.sendKeys(Key.ENTER);
      await waitForUrlChange(t);

      t.not(
        await t.context.session.getCurrentUrl(),
        t.context.url,
        'Key enter when focus on list item at index ' + index + 'should active the link for menubutton ' + ex.menubuttonSelectors[i]
      );
    }
  }

});

ariaTest.failing('"escape" on role="menuitem"', exampleFile, 'menu-escape', async (t) => {

});

ariaTest.failing('"down arrow" on role="menuitem"', exampleFile, 'menu-down-arrow', async (t) => {

});

ariaTest.failing('"up arrow" on role="menuitem"', exampleFile, 'menu-up-arrow', async (t) => {

});

ariaTest.failing('"home" on role="menuitem"', exampleFile, 'menu-home', async (t) => {

});

ariaTest.failing('"end" on role="menuitem"', exampleFile, 'menu-end', async (t) => {

});

ariaTest.failing('"character" on role="menuitem"', exampleFile, 'menu-character', async (t) => {

});
