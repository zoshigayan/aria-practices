const { ariaTest } = require('..');
const { By, Key } = require('selenium-webdriver');
const assertAriaControls = require('../util/assertAriaControls');
const assertAriaLabelExists = require('../util/assertAriaLabelExists');
const assertAriaRoles = require('../util/assertAriaRoles');
const assertAttributeDNE = require('../util/assertAttributeDNE');
const assertAttributeValues = require('../util/assertAttributeValues');
const assertRovingTabindex = require('../util/assertRovingTabindex');
const assertTabOrder = require('../util/assertTabOrder');
const replaceExternalLink = require('../util/replaceExternalLink');

const exampleFile = 'toolbar/toolbar.html';

const ex = {
  toolbarSelector: '#ex1 [role="toolbar"]',
  toolbarLabel: 'Example Toolbar',
  itemSelector: '#ex1 .item',
  buttonSelector: '#ex1 button',
  buttonIconSelector: '#ex1 button span.fas',
  styleButtonsSelector: '#ex1 .group:nth-child(1) button',
  alignmentGroupSelector: '#ex1 [role="radiogroup"]',
  alignmentButtonsSelector: '#ex1 .group:nth-child(2) button',
  textEditButtonsSelector: '#ex1 .group:nth-child(3) button',
  fontFamilyButtonSelector: '#ex1 .group:nth-child(4) button',
  fontFamilyMenuitemSelector: '#ex1 [role="menuitemradio"]',
  menuSelector: '#ex1 [role="menu"]',
  spinSelector: '#ex1 [role="spinbutton"]',
  spinUpSelector: '#ex1 [role="spinbutton"] .increase',
  spinDownSelector: '#ex1 [role="spinbutton"] .decrease',
  spinTextSelector: '#ex1 [role="spinbutton"] .value',
  checkboxSelector: '#ex1 #checkbox',
  linkSelector: '#ex1 #link',
  tabbableItemBeforeToolbarSelector: '[href="../../#kbd_roving_tabindex"]',
  textArea: '#ex1 textarea',
  itemsWithPopups: [0, 1, 2, 3, 4, 5],
  toggleItems: [0, 1, 2],
  toggleItemStyle: {
    0: {
      style: 'fontWeight',
      active: 'bold',
      inactive: 'normal',
    },
    1: {
      style: 'fontStyle',
      active: 'italic',
      inactive: 'normal',
    },
    2: {
      style: 'textDecoration',
      active: 'underline',
      inactive: 'none',
    },
  },
  radioItems: [3, 4, 5],
  radioItemStyle: { 3: 'left', 4: 'center', 5: 'right' },
};

const clickAndWait = async function (t, selector, index) {
  index = index || 0;
  let elements = await t.context.queryElements(t, selector);
  await elements[index].click();

  return await t.context.session
    .wait(
      async function () {
        let tabindex = await elements[index].getAttribute('tabindex');
        return tabindex === '0';
      },
      t.context.waitTime,
      `Timeout waiting for click to set tabindex="0" on '${selector}' at index ${index}`
    )
    .catch((err) => {
      return err;
    });
};

const waitAndCheckFocus = async function (t, selector, index) {
  index = index || 0;
  return t.context.session
    .wait(
      async function () {
        return t.context.session.executeScript(
          function () {
            const [selector, index] = arguments;
            let items = document.querySelectorAll(selector);
            return items[index] === document.activeElement;
          },
          selector,
          index
        );
      },
      t.context.waitTime,
      `Timeout waiting for activeElement to become '${selector}' at index ${index}`
    )
    .catch((err) => {
      return err;
    });
};

const waitAndCheckTabindex = async function (t, selector) {
  return t.context.session
    .wait(
      async function () {
        let item = await t.context.session.findElement(By.css(selector));
        return (await item.getAttribute('tabindex')) === '0';
      },
      600,
      'Timeout waiting for tabindex to set to "0" for: ' + selector
    )
    .catch((err) => {
      return err;
    });
};

const checkStyle = async function (t, style, value) {
  return t.context.session.executeScript(
    function () {
      const [style, value] = arguments;
      let textArea = document.querySelector('#ex1 textarea');
      return textArea.style[style] === value;
    },
    style,
    value
  );
};

// Attributes

ariaTest(
  'Toolbar element has role="toolbar"',
  exampleFile,
  'toolbar-role',
  async (t) => {
    await assertAriaRoles(t, 'ex1', 'toolbar', '1', 'div');
  }
);

ariaTest(
  'Toolbar element has "aria-label"',
  exampleFile,
  'toolbar-aria-label',
  async (t) => {
    await assertAriaLabelExists(t, ex.toolbarSelector);
  }
);

ariaTest(
  'Toolbar element has "aria-controls"',
  exampleFile,
  'toolbar-aria-controls',
  async (t) => {
    await assertAriaControls(t, ex.toolbarSelector);
  }
);

ariaTest(
  'Toolbar items support roving tabindex on toolbar items (Part 1)',
  exampleFile,
  'toolbar-item-tabindex',
  async (t) => {
    // Test all the toolbar items with roving tab index
    await assertRovingTabindex(t, ex.itemSelector, Key.ARROW_RIGHT);
  }
);

ariaTest(
  'Toolbar buttons have aria-pressed',
  exampleFile,
  'toolbar-button-aria-pressed',
  async (t) => {
    await assertAttributeValues(
      t,
      ex.styleButtonsSelector,
      'aria-pressed',
      'false'
    );

    let buttons = await t.context.queryElements(t, ex.styleButtonsSelector);
    for (let button of buttons) {
      await button.click();
    }

    await assertAttributeValues(
      t,
      ex.styleButtonsSelector,
      'aria-pressed',
      'true'
    );
  }
);

ariaTest(
  'All toolbar images have aria-hidden',
  exampleFile,
  'toolbar-aria-hidden',
  async (t) => {
    await assertAttributeValues(
      t,
      ex.buttonIconSelector,
      'aria-hidden',
      'true'
    );
  }
);

ariaTest(
  'Div has "radiogroup" role',
  exampleFile,
  'toolbar-radiogroup-role',
  async (t) => {
    await assertAriaRoles(t, 'ex1', 'radiogroup', '1', 'div');
  }
);

ariaTest(
  'Radiogroup has aria-label',
  exampleFile,
  'toolbar-radiogroup-aria-label',
  async (t) => {
    await assertAriaLabelExists(t, ex.alignmentGroupSelector);
  }
);

ariaTest(
  'Radio buttons have radio role',
  exampleFile,
  'toolbar-radio-role',
  async (t) => {
    await assertAriaRoles(t, 'ex1', 'radio', '3', 'button');
  }
);

ariaTest(
  'Radio buttons had aria-checked',
  exampleFile,
  'toolbar-radio-aria-checked',
  async (t) => {
    let buttons = await t.context.queryElements(t, ex.alignmentButtonsSelector);

    for (let i = 0; i < buttons.length; i++) {
      await buttons[i].click();
      for (let j = 0; j < buttons.length; j++) {
        let value = j === i ? 'true' : 'false';
        t.is(
          await buttons[j].getAttribute('aria-checked'),
          value,
          'Only alignment button ' +
            i +
            ' should have aria-checked set after clicking alignment button ' +
            i
        );
      }
    }
  }
);

ariaTest(
  'Text edit buttons have aria-disabled set to true by default',
  exampleFile,
  'toolbar-button-aria-disabled',
  async (t) => {
    await assertAttributeValues(
      t,
      ex.textEditButtonsSelector,
      'aria-disabled',
      'true'
    );
  }
);

ariaTest(
  'Font family button has aria-label',
  exampleFile,
  'toolbar-menubutton-aria-label',
  async (t) => {
    await assertAriaLabelExists(t, ex.fontFamilyButtonSelector);
  }
);

ariaTest(
  'Font family button has aria-haspopup',
  exampleFile,
  'toolbar-menubutton-aria-haspopup',
  async (t) => {
    await assertAttributeValues(
      t,
      ex.fontFamilyButtonSelector,
      'aria-haspopup',
      'true'
    );
  }
);

ariaTest(
  'Font family button has aria-controls',
  exampleFile,
  'toolbar-menubutton-aria-controls',
  async (t) => {
    await assertAriaControls(t, ex.fontFamilyButtonSelector);
  }
);

ariaTest(
  'Font family button has aria-expanded',
  exampleFile,
  'toolbar-menubutton-aria-expanded',
  async (t) => {
    await assertAttributeDNE(t, ex.fontFamilyButtonSelector, 'aria-expanded');

    await (
      await t.context.session.findElement(By.css(ex.fontFamilyButtonSelector))
    ).click();

    await assertAttributeValues(
      t,
      ex.fontFamilyButtonSelector,
      'aria-expanded',
      'true'
    );
  }
);

ariaTest(
  'Font family menu has menu role',
  exampleFile,
  'toolbar-menu-role',
  async (t) => {
    await assertAriaRoles(t, 'ex1', 'menu', '1', 'ul');
  }
);

ariaTest(
  'Font family menu has aria-label',
  exampleFile,
  'toolbar-menu-aria-label',
  async (t) => {
    await assertAriaLabelExists(t, ex.menuSelector);
  }
);

ariaTest(
  'Menuitemradio role',
  exampleFile,
  'toolbar-menuitemradio-role',
  async (t) => {
    await assertAriaRoles(t, 'ex1', 'menuitemradio', '5', 'li');
  }
);

ariaTest(
  'menuitemradio elements have aria-checked set',
  exampleFile,
  'toolbar-menuitemradio-aria-checked',
  async (t) => {
    let menuButton = await t.context.session.findElement(
      By.css(ex.fontFamilyButtonSelector)
    );
    let menuItems = await t.context.queryElements(
      t,
      ex.fontFamilyMenuitemSelector
    );
    let menu = await t.context.session.findElement(By.css(ex.menuSelector));

    for (let i = 0; i < menuItems.length; i++) {
      await menuButton.click();
      await t.context.session.wait(
        async function () {
          return await menu.isDisplayed();
        },
        t.context.waitTime,
        `Waiting for menu to open`
      );

      await menuItems[i].click();
      await menuButton.click();
      for (let j = 0; j < menuItems.length; j++) {
        let value = j === i ? 'true' : 'false';
        t.is(
          await menuItems[j].getAttribute('aria-checked'),
          value,
          'Only alignment button ' +
            i +
            ' should have aria-checked set after clicking alignment button ' +
            i
        );
      }
    }
  }
);

ariaTest(
  'menuitemradio elements have tabindex set to -1',
  exampleFile,
  'toolbar-menuitemradio-tabindex',
  async (t) => {
    await (
      await t.context.session.findElement(By.css(ex.fontFamilyButtonSelector))
    ).click();

    await assertAttributeValues(
      t,
      ex.fontFamilyMenuitemSelector,
      'tabindex',
      '-1'
    );
  }
);

ariaTest(
  'Spinbutton has aria-label',
  exampleFile,
  'toolbar-spinbutton-aria-label',
  async (t) => {
    await assertAriaLabelExists(t, ex.spinSelector);
  }
);

ariaTest(
  'Spinbutton has aria-valuenow',
  exampleFile,
  'toolbar-spinbutton-aria-valuenow',
  async (t) => {
    await assertAttributeValues(t, ex.spinSelector, 'aria-valuenow', '14');

    await (
      await t.context.session.findElement(By.css(ex.spinUpSelector))
    ).click();
    await assertAttributeValues(t, ex.spinSelector, 'aria-valuenow', '15');

    await (
      await t.context.session.findElement(By.css(ex.spinDownSelector))
    ).click();
    await assertAttributeValues(t, ex.spinSelector, 'aria-valuenow', '14');
  }
);

ariaTest(
  'Spin button had valuetext',
  exampleFile,
  'toolbar-spinbutton-aria-valuetext',
  async (t) => {
    await assertAttributeValues(
      t,
      ex.spinSelector,
      'aria-valuetext',
      '14 Point'
    );

    t.is(
      await (
        await t.context.session.findElement(By.css(ex.spinSelector))
      ).getAttribute('aria-valuetext'),
      await (
        await t.context.session.findElement(By.css(ex.spinTextSelector))
      ).getText(),
      'The spin buttons aria-valuetext attribute should match the text on the spin button'
    );

    await (
      await t.context.session.findElement(By.css(ex.spinUpSelector))
    ).click();
    await assertAttributeValues(
      t,
      ex.spinSelector,
      'aria-valuetext',
      '15 Point'
    );

    t.is(
      await (
        await t.context.session.findElement(By.css(ex.spinSelector))
      ).getAttribute('aria-valuetext'),
      await (
        await t.context.session.findElement(By.css(ex.spinTextSelector))
      ).getText(),
      'The spin buttons aria-valuetext attribute should match the text on the spin button'
    );

    await (
      await t.context.session.findElement(By.css(ex.spinDownSelector))
    ).click();
    await assertAttributeValues(
      t,
      ex.spinSelector,
      'aria-valuetext',
      '14 Point'
    );

    t.is(
      await (
        await t.context.session.findElement(By.css(ex.spinSelector))
      ).getAttribute('aria-valuetext'),
      await (
        await t.context.session.findElement(By.css(ex.spinTextSelector))
      ).getText(),
      'The spin buttons aria-valuetext attribute should match the text on the spin button'
    );
  }
);

ariaTest(
  'Spin button has valuemin',
  exampleFile,
  'toolbar-spinbutton-aria-valuemin',
  async (t) => {
    await assertAttributeValues(t, ex.spinSelector, 'aria-valuemin', '8');
  }
);

ariaTest('', exampleFile, 'toolbar-spinbutton-aria-valuemax', async (t) => {
  await assertAttributeValues(t, ex.spinSelector, 'aria-valuemax', '40');
});

// Keys

ariaTest('key TAB moves focus', exampleFile, 'toolbar-tab', async (t) => {
  await assertTabOrder(t, [
    ex.tabbableItemBeforeToolbarSelector,
    ex.itemSelector,
    ex.textArea,
  ]);

  await (
    await t.context.session.findElement(By.css(ex.alignmentButtonsSelector))
  ).click();

  await assertTabOrder(t, [
    ex.tabbableItemBeforeToolbarSelector,
    ex.alignmentButtonsSelector,
    ex.textArea,
  ]);
});

ariaTest(
  'key LEFT ARROW moves focus',
  exampleFile,
  'toolbar-left-arrow',
  async (t) => {
    // Put focus on the first item in the list
    await clickAndWait(t, ex.itemSelector);

    let items = await t.context.queryElements(t, ex.itemSelector);

    // Send ARROW LEFT key to the first item
    await items[0].sendKeys(Key.ARROW_LEFT);

    // Focus should now be on last item
    t.true(
      await waitAndCheckFocus(t, ex.itemSelector, items.length - 1),
      `Sending ARROW_LEFT to item at index 0 should move focus to item at index ${
        items.length - 1
      }`
    );

    t.is(
      await items[items.length - 1].getAttribute('tabindex'),
      '0',
      `Sending ARROW_LEFT to item at index 0 should set tabindex=0 for item at index ${
        items.length - 1
      }`
    );

    for (let i = items.length - 1; i > 0; i--) {
      await items[i].sendKeys(Key.ARROW_LEFT);

      t.true(
        await waitAndCheckFocus(t, ex.itemSelector, i - 1),
        `Sending ARROW_LEFT to item at index ${i} should move focus to item at index ${
          i - 1
        }`
      );

      t.is(
        await items[i - 1].getAttribute('tabindex'),
        '0',
        `Sending ARROW_LEFT to item at index ${i} should set tabindex=0 for item at index ${
          i - 1
        }`
      );
    }
  }
);

ariaTest(
  'key RIGHT ARROW moves focus',
  exampleFile,
  'toolbar-right-arrow',
  async (t) => {
    // Put focus on the first item in the list
    await clickAndWait(t, ex.itemSelector);

    let items = await t.context.queryElements(t, ex.itemSelector);

    for (let i = 0; i < items.length - 2; i++) {
      await items[i].sendKeys(Key.ARROW_RIGHT);

      t.true(
        await waitAndCheckFocus(t, ex.itemSelector, i + 1),
        `Sending ARROW_RIGHT to item at index ${i} should move focus to item at index ${
          i + 1
        }`
      );

      t.is(
        await items[i + 1].getAttribute('tabindex'),
        '0',
        `Sending ARROW_RIGHT to item at index ${i} should set tabindex=0 for item at index ${
          i + 1
        }`
      );
    }

    // Send ARROW RIGHT key to the last item
    await items[items.length - 1].sendKeys(Key.ARROW_RIGHT);

    // Focus should now be on first
    t.true(
      await waitAndCheckFocus(t, ex.itemSelector, 0),
      `Sending ARROW_RIGHT to the last item should move focus to the first item`
    );

    t.is(
      await items[0].getAttribute('tabindex'),
      '0',
      `Sending ARROW_RIGHT to the last item should set tabindex=0 for the first item at index`
    );
  }
);

ariaTest('key HOME moves focus', exampleFile, 'toolbar-home', async (t) => {
  let items = await t.context.queryElements(t, ex.itemSelector);

  for (let i = 0; i < items.length; i++) {
    await items[i].sendKeys(Key.HOME);

    t.true(
      await waitAndCheckFocus(t, ex.itemSelector, 0),
      `Sending HOME to item at index ${i} should move focus to the first item`
    );

    t.is(
      await items[0].getAttribute('tabindex'),
      '0',
      `Sending HOME to item at index ${i} should set tabindex=0 on the first item`
    );
  }
});

ariaTest('key END moves focus', exampleFile, 'toolbar-end', async (t) => {
  let items = await t.context.queryElements(t, ex.itemSelector);

  for (let i = 0; i < items.length; i++) {
    await items[i].sendKeys(Key.END);

    t.true(
      await waitAndCheckFocus(t, ex.itemSelector, items.length - 1),
      `Sending END to item at index ${i} should move focus to the last item`
    );

    t.is(
      await items[items.length - 1].getAttribute('tabindex'),
      '0',
      `Sending END to item at index ${i} should set tabindex=0 on the last item`
    );
  }
});

ariaTest(
  'key ESCAPE closes popup',
  exampleFile,
  'toolbar-toggle-esc',
  async (t) => {
    let items = await t.context.queryElements(t, ex.itemSelector);

    for (let i of ex.itemsWithPopups) {
      await clickAndWait(t, ex.itemSelector, i);

      let popup = await items[i].findElement(By.css('span.popup-label'));
      t.true(
        await popup.isDisplayed(),
        `Clicking menu item ${i} should display a popup and is not, this test might be broken.`
      );

      await items[i].sendKeys(Key.ESCAPE);

      t.false(
        await popup.isDisplayed(),
        `Sending key ESCAPE to menuitem ${i} should close popup label.`
      );
    }
  }
);

ariaTest(
  'Key ENTER toggles toggle buttons',
  exampleFile,
  'toolbar-toggle-enter-or-space',
  async (t) => {
    let items = await t.context.queryElements(t, ex.itemSelector);

    for (let i of ex.toggleItems) {
      await items[i].sendKeys(Key.ENTER);

      t.is(
        await items[i].getAttribute('aria-pressed'),
        'true',
        `Sending enter to inactive toggle at index ${i} should set aria-pressed to true`
      );
      t.true(
        await checkStyle(
          t,
          ex.toggleItemStyle[i].style,
          ex.toggleItemStyle[i].active
        ),
        `Sending enter to inactive toggle at index ${i} should set the style ${ex.toggleItemStyle[i].style} in the text area to ${ex.toggleItemStyle[i].active}`
      );

      await items[i].sendKeys(Key.ENTER);

      t.is(
        await items[i].getAttribute('aria-pressed'),
        'false',
        `Sending enter to active toggle at index ${i} should set aria-pressed to false`
      );
      t.true(
        await checkStyle(
          t,
          ex.toggleItemStyle[i].style,
          ex.toggleItemStyle[i].inactive
        ),
        `Sending enter to active toggle at index ${i} should set the style ${ex.toggleItemStyle[i].style} in the text area to ${ex.toggleItemStyle[i].inactive}.`
      );
    }
  }
);

ariaTest(
  'Key SPACE toggles toggle buttons',
  exampleFile,
  'toolbar-toggle-enter-or-space',
  async (t) => {
    let items = await t.context.queryElements(t, ex.itemSelector);

    for (let i of ex.toggleItems) {
      await items[i].sendKeys(Key.SPACE);

      t.is(
        await items[i].getAttribute('aria-pressed'),
        'true',
        `Sending space to inactive toggle at index ${i} should set aria-pressed to true`
      );
      t.true(
        await checkStyle(
          t,
          ex.toggleItemStyle[i].style,
          ex.toggleItemStyle[i].active
        ),
        `Sending space to inactive toggle at index ${i} should set the style ${ex.toggleItemStyle[i].style} in the text area to ${ex.toggleItemStyle[i].active}`
      );

      await items[i].sendKeys(Key.SPACE);

      t.is(
        await items[i].getAttribute('aria-pressed'),
        'false',
        `Sending space to active toggle at index ${i} should set aria-pressed to false`
      );
      t.true(
        await checkStyle(
          t,
          ex.toggleItemStyle[i].style,
          ex.toggleItemStyle[i].inactive
        ),
        `Sending space to active toggle at index ${i} should set the style ${ex.toggleItemStyle[i].style} in the text area to ${ex.toggleItemStyle[i].inactive}.`
      );
    }
  }
);

ariaTest(
  'Key ENTER selects radio option for alignment',
  exampleFile,
  'toolbar-radio-enter-or-space',
  async (t) => {
    let items = await t.context.queryElements(t, ex.itemSelector);

    for (let i of ex.radioItems) {
      await items[i].sendKeys(Key.ENTER);

      t.is(
        await items[i].getAttribute('aria-checked'),
        'true',
        `Sending enter to item at index ${i} should set aria-checked to true`
      );
      t.true(
        await checkStyle(t, 'textAlign', ex.radioItemStyle[i]),
        `Sending enter to radio index ${i} should set the style 'textAlign' style in the text area to ${ex.radioItemStyle[i]}}`
      );
    }
  }
);

ariaTest(
  'Key SPACE selects radio option for alignment',
  exampleFile,
  'toolbar-radio-enter-or-space',
  async (t) => {
    let items = await t.context.queryElements(t, ex.itemSelector);

    for (let i of ex.radioItems) {
      await items[i].sendKeys(Key.SPACE);

      t.is(
        await items[i].getAttribute('aria-checked'),
        'true',
        `Sending SPACE to item at index ${i} should set aria-checked to true`
      );
      t.true(
        await checkStyle(t, 'textAlign', ex.radioItemStyle[i]),
        `Sending SPACE to radio index ${i} should set the style 'textAlign' style in the text area to ${ex.radioItemStyle[i]}}`
      );
    }
  }
);

ariaTest(
  'Key DOWN ARROW moves focus between radio text align items',
  exampleFile,
  'toolbar-radio-down-arrow',
  async (t) => {
    let items = await t.context.queryElements(t, ex.itemSelector);

    await items[ex.radioItems[0]].sendKeys(Key.ARROW_DOWN);

    for (let i of ex.radioItems.slice(1)) {
      t.true(
        await waitAndCheckFocus(t, ex.itemSelector, i),
        `Sending ARROW DOWN to radio item at index ${
          i - 1
        } should move focus to item at index ${i}`
      );

      t.is(
        await items[i].getAttribute('tabindex'),
        '0',
        `Sending ARROW DOWN to radio item at index ${
          i - 1
        } should set tabindex=0 for item at index ${i}`
      );

      await items[i].sendKeys(Key.ARROW_DOWN);
    }

    // Focus should now be on first
    t.true(
      await waitAndCheckFocus(t, ex.itemSelector, ex.radioItems[0]),
      `Sending ARROW DOWN to the last radio item should move focus to the first radio item`
    );

    t.is(
      await items[ex.radioItems[0]].getAttribute('tabindex'),
      '0',
      `Sending ARROW DOWN to the last radio item should set tabindex=0 for the first radio item`
    );
  }
);

ariaTest(
  'Key UP ARROW moves focus between radio text align items',
  exampleFile,
  'toolbar-radio-up-arrow',
  async (t) => {
    let items = await t.context.queryElements(t, ex.itemSelector);

    await items[ex.radioItems[0]].sendKeys(Key.ARROW_UP);

    let lastItemIndex = ex.radioItems.length - 1;

    t.true(
      await waitAndCheckFocus(t, ex.itemSelector, ex.radioItems[lastItemIndex]),
      `Sending ARROW UP to the first radio item should move focus to the last radio item`
    );

    t.is(
      await items[ex.radioItems[lastItemIndex]].getAttribute('tabindex'),
      '0',
      `Sending ARROW UP to the first radio item should set tabindex=0 for the last radio item`
    );

    for (let i of ex.radioItems.slice(1).reverse()) {
      await items[i].sendKeys(Key.ARROW_UP);

      t.true(
        await waitAndCheckFocus(t, ex.itemSelector, i - 1),
        `Sending ARROW UP to radio item at index ${i} should move focus to item at index ${
          i - 1
        }`
      );

      t.is(
        await items[i - 1].getAttribute('tabindex'),
        '0',
        `Sending ARROW UP to radio item at index ${i} should set tabindex=0 for item at index ${
          i - 1
        }`
      );
    }
  }
);

ariaTest(
  'Test key enter on copy/past/cut keys',
  exampleFile,
  'toolbar-button-enter-or-space',
  async (t) => {
    let textarea = await t.context.session.findElement(By.css('textarea'));
    await textarea.sendKeys(Key.chord(Key.CONTROL, 'a'));
    let originalText = await textarea.getAttribute('value');

    const buttons = await t.context.queryElements(
      t,
      ex.textEditButtonsSelector
    );
    const copy = 0;
    const paste = 1;
    const cut = 2;

    t.is(
      await buttons[copy].getAttribute('aria-disabled'),
      'false',
      'After selecting text'
    );
    t.is(
      await buttons[paste].getAttribute('aria-disabled'),
      'true',
      'After selecting text'
    );
    t.is(
      await buttons[cut].getAttribute('aria-disabled'),
      'false',
      'After selecting text'
    );

    // SEND ENTER TO COPY
    await buttons[copy].sendKeys(Key.ENTER);

    t.is(
      await buttons[copy].getAttribute('aria-disabled'),
      'false',
      'After copy'
    );
    t.is(
      await buttons[paste].getAttribute('aria-disabled'),
      'false',
      'After copy'
    );
    t.is(
      await buttons[cut].getAttribute('aria-disabled'),
      'false',
      'After copy'
    );

    // SEND ENTER TO CUT
    await buttons[cut].sendKeys(Key.ENTER);

    t.is(
      await buttons[copy].getAttribute('aria-disabled'),
      'true',
      'After cut'
    );
    t.is(
      await buttons[paste].getAttribute('aria-disabled'),
      'false',
      'After cut'
    );
    t.is(await buttons[cut].getAttribute('aria-disabled'), 'true', 'After cut');

    await t.context.session.wait(
      async function () {
        return (await textarea.getAttribute('value')) === '';
      },
      t.context.waitTime,
      `Timeout waiting for sending ENTER to cut to clear text in textarea`
    );
    t.is(
      await textarea.getAttribute('value'),
      '',
      'After cut, there should be no text in the text area'
    );

    // SEND ENTER TO PASTE
    await buttons[paste].sendKeys(Key.ENTER);

    t.is(
      await textarea.getAttribute('value'),
      originalText,
      'After paste, there should be the previous text in the text area'
    );
  }
);

ariaTest(
  'Test key space on copy/past/cut keys',
  exampleFile,
  'toolbar-button-enter-or-space',
  async (t) => {
    let textarea = await t.context.session.findElement(By.css('textarea'));
    await textarea.sendKeys(Key.chord(Key.CONTROL, 'a'));
    let originalText = await textarea.getAttribute('value');

    const buttons = await t.context.queryElements(
      t,
      ex.textEditButtonsSelector
    );
    const copy = 0;
    const paste = 1;
    const cut = 2;

    t.is(
      await buttons[copy].getAttribute('aria-disabled'),
      'false',
      'After selecting text'
    );
    t.is(
      await buttons[paste].getAttribute('aria-disabled'),
      'true',
      'After selecting text'
    );
    t.is(
      await buttons[cut].getAttribute('aria-disabled'),
      'false',
      'After selecting text'
    );

    // SEND SPACE TO COPY
    await buttons[copy].sendKeys(Key.SPACE);

    t.is(
      await buttons[copy].getAttribute('aria-disabled'),
      'false',
      'After copy'
    );
    t.is(
      await buttons[paste].getAttribute('aria-disabled'),
      'false',
      'After copy'
    );
    t.is(
      await buttons[cut].getAttribute('aria-disabled'),
      'false',
      'After copy'
    );

    // SEND SPACE TO CUT
    await buttons[cut].sendKeys(Key.SPACE);

    t.is(
      await buttons[copy].getAttribute('aria-disabled'),
      'true',
      'After cut'
    );
    t.is(
      await buttons[paste].getAttribute('aria-disabled'),
      'false',
      'After cut'
    );
    t.is(await buttons[cut].getAttribute('aria-disabled'), 'true', 'After cut');

    await t.context.session.wait(
      async function () {
        return (await textarea.getAttribute('value')) === '';
      },
      t.context.waitTime,
      `Timeout waiting for sending SPACE to cut to clear text in textarea`
    );
    t.is(
      await textarea.getAttribute('value'),
      '',
      'After cut, there should be no text in the text area'
    );

    // SEND SPACE TO PASTE
    await buttons[paste].sendKeys(Key.SPACE);

    t.is(
      await textarea.getAttribute('value'),
      originalText,
      'After paste, there should be the previous text in the text area'
    );
  }
);

ariaTest(
  'Keys for opening menubutton',
  exampleFile,
  'toolbar-menubutton-enter-or-space-or-down-or-up',
  async (t) => {
    const menubutton = await t.context.session.findElement(
      By.css(ex.fontFamilyButtonSelector)
    );
    const menu = await t.context.session.findElement(By.css(ex.menuSelector));

    for (let key of [Key.ENTER, Key.SPACE, Key.ARROW_UP, Key.ARROW_DOWN]) {
      await menubutton.sendKeys(key);

      t.true(
        await menu.isDisplayed(),
        `After sending key ${key} the menu should be displayed`
      );

      t.true(
        await waitAndCheckFocus(t, ex.fontFamilyMenuitemSelector, 0),
        `After sending key ${key} the focus should be on the first item`
      );

      // Close the menu by clicking outside of it
      await (await t.context.session.findElement(By.css('#ex_label'))).click();
    }

    // Select a different font family, and confirm that opening the submenu puts focus on selected font family

    await menubutton.sendKeys(Key.ENTER);
    await (
      await t.context.queryElements(t, ex.fontFamilyMenuitemSelector)
    )[1].click();

    for (let key of [Key.ENTER, Key.SPACE, Key.ARROW_UP, Key.ARROW_DOWN]) {
      await menubutton.sendKeys(key);

      t.true(
        await menu.isDisplayed(),
        `After sending key ${key} the menu should be displayed`
      );

      t.true(
        await waitAndCheckFocus(t, ex.fontFamilyMenuitemSelector, 1),
        `Now that the second font has been selected, after sending key ${key} the focus should be on the second item`
      );

      // Close the menu by clicking outside of it
      await (await t.context.session.findElement(By.css('#ex_label'))).click();
    }
  }
);

ariaTest(
  'Key ENTER changes font',
  exampleFile,
  'toolbar-menu-enter-or-space',
  async (t) => {
    const menubutton = await t.context.session.findElement(
      By.css(ex.fontFamilyButtonSelector)
    );
    const menuitems = await t.context.queryElements(
      t,
      ex.fontFamilyMenuitemSelector
    );

    for (let i = 0; i < menuitems.length; i++) {
      await menubutton.sendKeys(Key.ENTER);
      let font = await menuitems[i].getText();
      await menuitems[i].sendKeys(Key.ENTER);
      t.true(
        await checkStyle(t, 'fontFamily', font.toLowerCase()),
        `The font family in the text area should be updated to reflect the menuitem ('${font}') when sending key 'ENTER'`
      );
    }
  }
);

ariaTest(
  'Key SPACE changes font',
  exampleFile,
  'toolbar-menu-enter-or-space',
  async (t) => {
    const menubutton = await t.context.session.findElement(
      By.css(ex.fontFamilyButtonSelector)
    );
    const menuitems = await t.context.queryElements(
      t,
      ex.fontFamilyMenuitemSelector
    );

    for (let i = 0; i < menuitems.length; i++) {
      await menubutton.sendKeys(Key.SPACE);
      let font = await menuitems[i].getText();
      await menuitems[i].sendKeys(Key.SPACE);
      t.true(
        await checkStyle(t, 'fontFamily', font.toLowerCase()),
        `The font family in the text area should be updated to reflect the menuitem ('${font}') when sending key 'SPACE'`
      );
    }
  }
);

ariaTest(
  'DOWN ARROW moves focus between menuitems',
  exampleFile,
  'toolbar-menu-down-arrow',
  async (t) => {
    const menubutton = await t.context.session.findElement(
      By.css(ex.fontFamilyButtonSelector)
    );
    const menuitems = await t.context.queryElements(
      t,
      ex.fontFamilyMenuitemSelector
    );

    await menubutton.sendKeys(Key.ENTER);

    for (let i = 0; i < menuitems.length - 1; i++) {
      await menuitems[i].sendKeys(Key.ARROW_DOWN);

      t.true(
        await waitAndCheckFocus(t, ex.fontFamilyMenuitemSelector, i + 1),
        `Sending ARROW DOWN to menuitem at index ${i} should move focus to item at index ${
          i + 1
        }`
      );
    }

    await menuitems[menuitems.length - 1].sendKeys(Key.ARROW_DOWN);

    t.true(
      await waitAndCheckFocus(t, ex.fontFamilyMenuitemSelector, 0),
      `Sending ARROW DOWN to the last menu item should move focus to the first menu item`
    );
  }
);

ariaTest(
  'UP ARROW moves focus',
  exampleFile,
  'toolbar-menu-up-arrow',
  async (t) => {
    const menubutton = await t.context.session.findElement(
      By.css(ex.fontFamilyButtonSelector)
    );
    const menuitems = await t.context.queryElements(
      t,
      ex.fontFamilyMenuitemSelector
    );

    await menubutton.sendKeys(Key.ENTER);
    await menuitems[0].sendKeys(Key.ARROW_UP);

    t.true(
      await waitAndCheckFocus(
        t,
        ex.fontFamilyMenuitemSelector,
        menuitems.length - 1
      ),
      `Sending ARROW UP to the first menu item should move focus to the last menu item`
    );

    for (let i = menuitems.length - 1; i > 0; i--) {
      await menuitems[i].sendKeys(Key.ARROW_UP);

      t.true(
        await waitAndCheckFocus(t, ex.fontFamilyMenuitemSelector, i - 1),
        `Sending ARROW UP to menuitem at index ${i} should move focus to item at index ${
          i - 1
        }`
      );
    }
  }
);

ariaTest(
  'ESC sent to menuitem closes menu',
  exampleFile,
  'toolbar-menu-escape',
  async (t) => {
    const menubutton = await t.context.session.findElement(
      By.css(ex.fontFamilyButtonSelector)
    );
    const menu = await t.context.session.findElement(By.css(ex.menuSelector));
    const menuitems = await t.context.queryElements(
      t,
      ex.fontFamilyMenuitemSelector
    );

    for (let i = menuitems.length - 1; i > 0; i--) {
      await menubutton.sendKeys(Key.ENTER);
      await menuitems[i].sendKeys(Key.ESCAPE);

      t.true(
        await waitAndCheckFocus(t, ex.fontFamilyButtonSelector),
        `Sending ESCAPE to menuitem at index ${i} should move focus to the font family menubutton`
      );
      t.false(
        await menu.isDisplayed(),
        `Sending ESCAPE to menuitem at index ${i} should close the menu`
      );
    }
  }
);

ariaTest(
  'DOWN ARROW to spinbutton decrease value by 1',
  exampleFile,
  'toolbar-spinbutton-down-arrow',
  async (t) => {
    const spinbutton = await t.context.session.findElement(
      By.css(ex.spinSelector)
    );

    const originalValue = await spinbutton.getAttribute('aria-valuenow');
    spinbutton.sendKeys(Key.ARROW_DOWN);

    await t.context.session.wait(
      async function () {
        return (
          (await spinbutton.getAttribute('aria-valuenow')) !== originalValue
        );
      },
      t.context.waitTime,
      'Timeout waiting for aria-valuenow value to change'
    );

    let valuenow = await spinbutton.getAttribute('aria-valuenow');

    t.is(
      parseInt(valuenow),
      parseInt(originalValue) - 1,
      `Sending down arrow to the spin button should switch the value to one less than the original value`
    );
    t.true(
      await checkStyle(t, 'fontSize', `${valuenow}pt`),
      `Sending down arrow to the spin button should switch the textarea's fontSize styling`
    );
  }
);

ariaTest(
  'UP ARROW to spin button increase value by 1',
  exampleFile,
  'toolbar-spinbutton-up-arrow',
  async (t) => {
    const spinbutton = await t.context.session.findElement(
      By.css(ex.spinSelector)
    );

    const originalValue = await spinbutton.getAttribute('aria-valuenow');
    spinbutton.sendKeys(Key.ARROW_UP);

    await t.context.session.wait(
      async function () {
        return (
          (await spinbutton.getAttribute('aria-valuenow')) !== originalValue
        );
      },
      t.context.waitTime,
      'Timeout waiting for aria-valuenow value to change'
    );

    let valuenow = await spinbutton.getAttribute('aria-valuenow');
    t.is(
      parseInt(valuenow),
      parseInt(originalValue) + 1,
      `Sending up arrow to the spin button should switch the value to one more than the original value`
    );

    t.true(
      await checkStyle(t, 'fontSize', `${valuenow}pt`),
      `Sending up arrow to the spin button should switch the textarea's fontSize styling`
    );
  }
);

ariaTest(
  'PAGE DOWN to spin button decrease value by 5',
  exampleFile,
  'toolbar-spinbutton-page-down',
  async (t) => {
    const spinbutton = await t.context.session.findElement(
      By.css(ex.spinSelector)
    );

    const originalValue = await spinbutton.getAttribute('aria-valuenow');
    spinbutton.sendKeys(Key.PAGE_DOWN);

    await t.context.session.wait(
      async function () {
        return (
          (await spinbutton.getAttribute('aria-valuenow')) !== originalValue
        );
      },
      t.context.waitTime,
      'Timeout waiting for aria-valuenow value to change'
    );

    let valuenow = await spinbutton.getAttribute('aria-valuenow');
    t.is(
      parseInt(valuenow),
      parseInt(originalValue) - 5,
      `Sending up arrow to the spin button should switch the value to five less than the original value`
    );

    t.true(
      await checkStyle(t, 'fontSize', `${valuenow}pt`),
      `Sending up arrow to the spin button should switch the textarea's fontSize styling`
    );
  }
);
ariaTest(
  'PAGE UP to spin button increase by 5',
  exampleFile,
  'toolbar-spinbutton-page-up',
  async (t) => {
    const spinbutton = await t.context.session.findElement(
      By.css(ex.spinSelector)
    );

    const originalValue = await spinbutton.getAttribute('aria-valuenow');
    spinbutton.sendKeys(Key.PAGE_UP);

    await t.context.session.wait(
      async function () {
        return (
          (await spinbutton.getAttribute('aria-valuenow')) !== originalValue
        );
      },
      t.context.waitTime,
      'Timeout waiting for aria-valuenow value to change'
    );

    let valuenow = await spinbutton.getAttribute('aria-valuenow');
    t.is(
      parseInt(valuenow),
      parseInt(originalValue) + 5,
      `Sending up arrow to the spin button should switch the value to one more than the original value`
    );

    t.true(
      await checkStyle(t, 'fontSize', `${valuenow}pt`),
      `Sending up arrow to the spin button should switch the textarea's fontSize styling`
    );
  }
);
