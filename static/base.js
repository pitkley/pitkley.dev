function updateFootnoteReferences() {
    // Retrieved from:
    //   https://github.com/getzola/zola/issues/1070#issuecomment-1166637092
    // Thanks to @fuzzypixelz for the code-snippet.

    const references = document.getElementsByClassName('footnote-reference')
    // For each footnote reference, set an id so we can refer to it from the definition.
    // If the definition had an id of 'some_id', then the reference has id `some_id_ref`.
    for (const reference of references) {
        const link = reference.firstChild
        const id = link.getAttribute('href').slice(1) // skip the '#'
        link.setAttribute('id', `${id}_ref`)
    }

    const footnotes = document.getElementsByClassName('footnote-definition')
    // For each footnote-definition, add an anchor element with an href to its corresponding reference.
    // The text used for the added anchor is 'Leftwards Arrow with Hook' (U+21A9).
    for (const footnote of footnotes) {
        const id = footnote.getAttribute('id')
        const backReference = document.createElement('a')
        backReference.setAttribute('href', `#${id}_ref`)
        backReference.textContent = '↩'
        footnote.append(backReference)
    }
}

function getTabContents(tabContainerId) {
    return document.querySelectorAll(`.tab-content[data-tab-container="${tabContainerId}"]`);
}

function selectTabContainerButton(tabContainerButtons, tab) {
    for (const tabContainerButton of tabContainerButtons) {
        const tabContainerButtonTab = tabContainerButton.getAttribute('data-tab');
        if (tabContainerButtonTab === tab) {
            tabContainerButton.classList.add('active');
        } else {
            tabContainerButton.classList.remove('active');
        }
    }
}

function selectTabContent(tabContents, tabNameToSelect) {
    for (const tabContent of tabContents) {
        const tabContentName = tabContent.getAttribute('data-tab-name');
        if (tabContentName === tabNameToSelect) {
            tabContent.classList.add('active');
        } else {
            tabContent.classList.remove('active');
        }
    }
}

function selectTab(tabContainerId, tabNameToSelect) {
    const tabContainer = document.getElementById(tabContainerId);
    const tabContainerButtons = tabContainer.querySelectorAll('button');
    const tabContents = getTabContents(tabContainerId);

    selectTabContainerButton(tabContainerButtons, tabNameToSelect);
    selectTabContent(tabContents, tabNameToSelect);
}

function fixupTabContainer(tabContainer) {
    const tabContainerId = tabContainer.getAttribute('id');
    tabContainer.innerHTML = '';
    const tabContents = getTabContents(tabContainerId);

    for (const tabContent of tabContents) {
        const active = tabContent.classList.contains('active');
        const tabName = tabContent.getAttribute('data-tab-name');
        const tabButton = document.createElement('button');
        tabButton.setAttribute('data-tab', tabName);
        tabButton.textContent = tabName;
        if (active) {
            tabButton.classList.add('active');
        }

        const li = document.createElement('li');
        li.append(tabButton);

        tabContainer.append(li);
    }
}

function findClosestTabContainer(tabContent) {
    let element = tabContent.previousSibling;
    while (element) {
        if (element.classList && element.classList.contains('tab-container')) {
            return element;
        }
        element = element.previousSibling;
    }
    throw new Error('Could not find tab-container');
}

const TAB_CONTENT_GENERATOR = {
    'strip-marker-comments': (tabContent) => {
        const tabName = tabContent.getAttribute('data-tab-name');
        tabContent.setAttribute('data-tab-name', tabName.replace('With', 'Without'));
        tabContent.classList.remove('active');
        const comments = tabContent.querySelectorAll('.z-comment');
        for (const comment of comments) {
            if (!comment.textContent.match(/^[#/]+\s+\d+\s+$/)) {
                continue;
            }
            const previousSibling = comment.previousSibling;
            if (!previousSibling) {
                continue;
            }
            previousSibling.textContent = '\n';
            comment.remove();
        }
        return tabContent;
    },
};

function fixupTabContents() {
    const tabContents = document.querySelectorAll('.tab-content');
    for (const tabContent of tabContents) {
        const tabContainer = findClosestTabContainer(tabContent);
        const tabContainerId = tabContainer.getAttribute('id');
        tabContent.setAttribute('data-tab-container', tabContainerId);

        const autoGenerateTab = tabContent.getAttribute('data-tab-auto-generate');
        if (autoGenerateTab in TAB_CONTENT_GENERATOR) {
            const tabContentGenerator = TAB_CONTENT_GENERATOR[autoGenerateTab];
            const newTabContent = tabContentGenerator(tabContent.cloneNode(true));
            tabContent.parentElement.insertBefore(
                newTabContent,
                tabContent.nextSibling,
            );
        }
    }
}

function handleTabContainers() {
    fixupTabContents();

    const tabContainers = document.getElementsByClassName('tab-container');
    for (const tabContainer of tabContainers) {
        fixupTabContainer(tabContainer);

        const tabContainerId = tabContainer.getAttribute('id');
        const tabContainerButtons = tabContainer.querySelectorAll('button');
        for (const tabContainerButton of tabContainerButtons) {
            tabContainerButton.addEventListener('click', () => {
                const tab = tabContainerButton.getAttribute('data-tab');
                selectTab(tabContainerId, tab);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', (_event) => {
    updateFootnoteReferences();
    handleTabContainers();
});
