// Tree pseudo-class
var Pine = function(options){
    // Main DOM element
    this.el = options.node;

    // Initial tree data
    this.sourceData = options.data;

    // Selected item's id
    this.selectedItemId = null;

    // Convert initial list data to tree
    this.buildRootNode();

    // Render tree data into main element
    this.el.innerHTML = this.rootNode.render();

    // Connect click listener
    this.el.addEventListener('click', this.onClick.bind(this));
};

// Convert initial list data to tree data
Pine.prototype.buildRootNode = function() {
    var i, item, parent;

    // Table of all tree items indexed by their ids (with root node)
    this.lookupTable = {0: new PineNode({
        itemId: 0,
        itemParentId: null,
        itemName: '#ROOT'
    })};

    // Populate lookup table
    for (i = 0; i < this.sourceData.length; i++) {
        item = this.sourceData[i];
        this.lookupTable[item.itemId] = new PineNode(item);
    }

    // Establish node relationships
    for (i in this.lookupTable) {
        // Skip root node
        if (i === '0') {
            continue;
        }
        // Get current item and it's parent
        item = this.lookupTable[i];
        parent = this.lookupTable[item.parent];
        // Add reference to item to parent's children list
        parent.children.push(item);
    }

    this.rootNode = this.lookupTable[0];
};

// Process click on the tree
Pine.prototype.onClick = function(event) {
    var target = event.target;
    var classes =  target.className.split(' ');

    if (classes.indexOf('pine__icon') !== -1) {
        this.onIconClick(event);
    }
    else if (classes.indexOf('pine__name') !== -1) {
        this.onLabelClick(event);
    }
};

// Process click on folding icons
Pine.prototype.onIconClick = function(event) {
    var parent = event.target.parentNode;
    var classes = parent.className.split(' ');

    if (classes.indexOf('pine__element--with-children') === -1) {
        return;
    }

    // If folded...
    if (parent.hasAttribute('data-folded')) {
        parent.removeAttribute('data-folded');
        parent.className = parent.className.replace(
            'pine__element--folded', 'pine__element--unfolded'
        );
    }
    // ... and if unfolded
    else if (!parent.hasAttribute('data-folded')) {
        parent.setAttribute('data-folded', true);
        parent.className = parent.className.replace(
            'pine__element--unfolded', 'pine__element--folded'
        );
    }
};

// Process click on node labels
Pine.prototype.onLabelClick = function(event) {
    var target = event.target;
    var parent = target.parentNode;
    var id = parent.getAttribute('data-id');
    var prevSelected = this.el.getElementsByClassName('pine__name--selected')[0];

    // Remove previous selected element's style
    if (prevSelected) {
        prevSelected.className = prevSelected.className.replace(' pine__name--selected', '');
    }

    // Highlight new selection
    target.className = target.className + ' pine__name--selected';

    // Save selected id
    this.selectedItemId = id;
};


// Tree node pseudo-class
var PineNode = function(obj) {
    this.id = obj.itemId;
    this.parent = obj.itemParentId;
    this.name = obj.itemName;
    this.children = [];
};

// Render tree node with it's children
PineNode.prototype.render = function(lvl) {
    lvl = lvl || 0;
    var str = '';
    var childrenStr = '';
    var foldedAttr = '';
    var i;

    // Render children nodes
    for (i = 0; i < this.children.length; i++) {
        childrenStr += this.children[i].render(lvl+2);
    }

    // Set folded attr if needed
    foldedAttr = this.children.length ? ' data-folded="true" ' : '';

    // Open node's markup
    str += this.indent(
        '<div class="' + this.className() +
        '" data-id="' + this.id +'"' +
        foldedAttr + '>\n', lvl
    );

    // Insert item icon
    if (this.id !== 0) {
        str += this.indent('<div class="pine__icon"></div>', lvl);
    }

    // Insert horizontal branch line
    str += this.indent('<div class="pine__hline"></div>', lvl);

    // Insert vertical branch line if needed
    if (this.children.length){
        str += this.indent('<div class="pine__vline"></div>', lvl);
    }

    // Insert node's name
    str += this.indent('    <span class="pine__name">' + this.name + '</span>\n', lvl);

    // Insert child nodes if needed
    if (childrenStr) {
        str += this.indent('    <div class="pine__children">\n', lvl);
        str += childrenStr;
        str += this.indent('    </div>\n', lvl);
    }

    // Close node's markup
    str += this.indent('</div>\n', lvl);

    return str;
};

// Indent HTML line to get prettier markup
PineNode.prototype.indent = function(str, lvl) {
    var TAB_WIDTH = 4;
    var spacesNum = TAB_WIDTH * lvl + 1;
    var spaces = new Array(spacesNum).join(' ');
    return spaces + str;
};

// Generate tree node's class name
PineNode.prototype.className = function() {
    var className = 'pine__element';

    if (this.id === 0) {
        className += ' pine__element--root';
    }

    if (this.parent === 0) {
        className += ' pine__element--first';
    }

    if (this.children.length) {
        className += ' pine__element--with-children';
    }

    if (this.id !== 0 && this.children.length) {
        className += ' pine__element--folded';
    }

    return className;
};
