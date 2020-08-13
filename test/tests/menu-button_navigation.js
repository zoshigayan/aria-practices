

const { ariaTest } = require('..');
const { By, Key } = require('selenium-webdriver');
const assertAttributeValues = require('../util/assertAttributeValues');
const assertAriaLabelledby = require('../util/assertAriaLabelledby');
const assertAriaControls = require('../util/assertAriaControls');
const assertAriaRoles = require('../util/assertAriaRoles');

const exampleFile = 'menu-button/menu-button-navigation.html';

const ex = {
  menubuttonSelector: '#ex1 button',
  menuSelector1: '#id-menu-about',
  menuSelector2: '#id-menu-admissions',
  menuSelector3: '#id-menu-academics',
  menuitemSelector: '#ex1 [role="menuitem"]',
  numMenuitems: 18
};

const waitForUrlChange = async function (t) {
  await t.context.session.wait(() => {
    return t.context.session.getCurrentUrl().then(url => {
      return url != t.context.url;
    });
  }, t.context.waitTime, 'Timeout waiting for url to update');
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
    await assertAriaLabelledby(t, ex.menuSelector1);
    await assertAriaLabelledby(t, ex.menuSelector2);
    await assertAriaLabelledby(t, ex.menuSelector3);
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

ariaTest.failing('"enter" on menu button', exampleFile, 'button-down-arrow-or-space-or-enter', async (t) => {

});

ariaTest.failing('"down arrow" on menu button', exampleFile, 'button-down-arrow-or-space-or-enter', async (t) => {

});

ariaTest.failing('"space" on menu button', exampleFile, 'button-down-arrow-or-space-or-enter', async (t) => {

});

ariaTest.failing('"up arrow" on menu button', exampleFile, 'button-up-arrow', async (t) => {

});

ariaTest.failing('"enter" on role="menuitem"', exampleFile, 'menu-enter', async (t) => {

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
