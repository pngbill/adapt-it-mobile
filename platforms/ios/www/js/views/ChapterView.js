define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        Selectable  = require('jqueryui'),
        tplText     = require('text!tpl/Chapter.html'),
        template    = Handlebars.compile(tplText),
//        placeText   = require('text!tpl/Placeholder.html'),
//        placeTpl    = Handlebars.compile(placeText),
        selectedStart = null,
        selectedEnd = null,
        idxStart = null,
        idxEnd = null,
        isSelecting = false,
        isPlaceholder = false,
        isPhrase = false,
        isRetranslation = false;

    return Backbone.View.extend({

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(template(this.model.toJSON()));
            //$(".pile").selectable();
            return this;
        },
        
        ////
        // Event Handlers
        ////
        events: {
            "click #Placeholder": "togglePlaceholder",
            "click #Phrase": "togglePhrase",
            "click #Retranslation": "toggleRetranslation",
            "mousedown .pile": "selectingPilesStart",
            "mouseup .pile": "selectingPilesEnd",
            "mousemove .pile": "selectingPilesMove",
            "selected .strip": "selectedStrip",
            "click .pile": "selectedPiles",
            "click .target": "selectedAdaptation",
            "keydown .topcoat-text-input": "editAdaptation",
            "blur .topcoat-text-input": "unselectedAdaptation"
        },
        // User clicked on the Placeholder button
        togglePlaceholder: function (event) {
            // if the current selection is a placeholder, remove it; if not,
            // add a placeholder before the current selection
            if (isPlaceholder === false) {
                // no placeholder at the selection -- add one
                //this.$el.html(placeTpl(this.model.toJSON()));
            } else {
                // selection is a placeholder -- delete it
            }
        },
        // User clicked on the Phrase button
        togglePhrase: function (event) {
            // if the current selection is a phrase, remove it; if not,
            // combine the selection into a new phrase
        },
        // User clicked on the Retranslation button
        toggleRetranslation: function (event) {
            // if the current selection is a retranslation, remove it; if not,
            // combine the selection into a new retranslation
        },
        // user is starting to select one or more piles
        selectingPilesStart: function (event) {
            // change the class of the mousedown area to let the user know
            // we're tracking the selection
            if (selectedStart !== null) {
                // there was an old selection -- remove the ui-selected class
                $("div").removeClass("ui-selecting ui-selected");
            }
            if (event.currentTarget.className !== "pile") {
                selectedStart = event.currentTarget.parentElement; // pile
                selectedEnd = selectedStart;
            } else {
                selectedStart = event.currentTarget; // pile
                selectedEnd = selectedStart;
            }
            idxStart = $(selectedStart).index() - 1; // BUGBUG why off by one?
            idxEnd = idxStart;
            console.log("selectedStart: " + selectedStart.id);
            console.log("selectedEnd: " + selectedEnd.id);
            isSelecting = true;
            if (event.currentTarget.className !== "pile") {
                event.currentTarget.parentElement.addClass("ui-selecting");
            } else {
                $(event.currentTarget).addClass("ui-selecting");
            }
        },
        // user is starting to select one or more piles
        selectingPilesMove: function (event) {
            var tmpEnd = null;
            if (event.currentTarget.className !== "pile") {
                tmpEnd = event.currentTarget.parentElement; // pile
            } else {
                tmpEnd = event.currentTarget; // pile
            }
            // only interested if we're selecting in the same strip
            if ((isSelecting === true) &&
                    (tmpEnd.parentElement === selectedStart.parentElement)) {
                // recalculate the new selectedEnd 
                selectedEnd = tmpEnd;
                idxEnd = $(tmpEnd).index() - 1; // EDB try
                console.log("selectedEnd: " + selectedEnd.id);
                $(event.currentTarget.parentElement.childNodes).removeClass("ui-selecting");
                if (idxStart === idxEnd) {
                    // try to find the pile element (this could be a child of that element)
                    if (event.currentTarget.className !== "pile") {
                        event.currentTarget.parentElement.addClass("ui-selected");
                    } else {
                        $(event.currentTarget).addClass("ui-selected");
                    }
                } else if (idxStart < idxEnd) {
                    $(selectedStart.parentElement).children(".pile").each(function(index, value) {
                        if (index >= idxStart && index <= idxEnd) {
                            $(value).addClass("ui-selecting");
                        }
                    });
                } else {
                    $(selectedStart.parentElement).children(".pile").each(function(index, value) {
                        if (index >= idxEnd && index <= idxStart) {
                            $(value).addClass("ui-selecting");
                        }
                    });
                }
            }
        },
        // user released the mouse here
        selectingPilesEnd: function (event) {
            if (isSelecting === true) {
                isSelecting = false;
                // change the class of the mousedown area to let the user know
                // we're tracking the selection
                $("div").removeClass("ui-selecting ui-selected");
                if (idxStart === idxEnd) {
                    // only one item selected -- can only create a placeholder
                    $("#Placeholder").prop('disabled', false);
                    $("#Phrase").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    // try to find the pile element (this could be a child of that element)
                    if (event.currentTarget.className !== "pile") {
                        event.currentTarget.parentElement.addClass("ui-selected");
                    } else {
                        $(event.currentTarget).addClass("ui-selected");
                    }
                } else if (idxStart < idxEnd) {
                    // more than one item selected -- can create a placeholder, phrase, retrans
                    $("#Placeholder").prop('disabled', false);
                    $("#Phrase").prop('disabled', false);
                    $("#Retranslation").prop('disabled', false);
                    $(selectedStart.parentElement).children(".pile").each(function(index, value) {
                        if (index >= idxStart && index <= idxEnd) {
                            $(value).addClass("ui-selected");
                        }
                    });
                } else {
                    // more than one item selected -- can create a placeholder, phrase, retrans
                    $("#Placeholder").prop('disabled', false);
                    $("#Phrase").prop('disabled', false);
                    $("#Retranslation").prop('disabled', false);
                    $(selectedStart.parentElement).children(".pile").each(function(index, value) {
                        if (index >= idxEnd && index <= idxStart) {
                            $(value).addClass("ui-selected");
                        }
                    });
                }
            }
        },
        // user has finished selecting one or more piles
        selectedPiles: function (event) {
            if (event.currentTarget !== selectedStart) {
                if (selectedStart !== null) {
                    // there was an old selection -- remove the ui-selected class
                    $("div").removeClass("ui-selecting ui-selected");
                }
                selectedStart = event.currentTarget; // pile
                $("#Placeholder").prop('disabled', false);
                // try to find the pile element (this could be a child of that element)
                if (event.currentTarget.className !== "pile") {
                    event.currentTarget.parentElement.addClass("ui-selected");
                } else {
                    $(event.currentTarget).addClass("ui-selected");
                }
            }
        },
        selectedStrip: function (event) {
            $("#Placeholder").prop('disabled', false);
            $("#Phrase").prop('disabled', false);
            $("#Retranslation").prop('disabled', false);
        },
        // user has moved the adaptation input field
        selectedAdaptation: function (event) {
            // set the current adaptation cursor
            selectedStart = event.currentTarget.parentElement; // pile
            console.log("selected: " + selectedStart.id);
            // hide the current static target text
            $(event.currentTarget).hide();
            // TODO: pull out the possible adaptation from the KB
            // show the input field and set focus to it
            $(event.currentTarget.nextElementSibling).show();
            $(event.currentTarget.nextElementSibling).focus();
        },
        editAdaptation: function (event) {
            if ((event.keyCode === 9) || (event.keyCode === 13)) {
                var next_edit = null;
                // If tab/enter is pressed, blur and move to edit the next pile
                event.stopPropagation();
                event.preventDefault();
                $(event.currentTarget).blur();
    
                if (event.shiftKey) {
                    next_edit = selectedStart.previousElementSibling;
                    if (next_edit.id.substr(0, 4) !== "pile") {
                        // Probably a header -- see if you can go to the previous strip
                        if (selectedStart.parentElement.previousElementSibling !== null) {
                            next_edit = selectedStart.parentElement.previousElementSibling.lastElementChild;
                        } else {
                            next_edit = null;
                            console.log("reached first pile.");
                        }
                    }
                } else {
                    if (selectedStart.nextElementSibling !== null) {
                        next_edit = selectedStart.nextElementSibling;
                    } else {
                        // last pile in the strip -- see if you can go to the next strip
                        if (selectedStart.parentElement.nextElementSibling !== null) {
                            next_edit = selectedStart.parentElement.nextElementSibling.childNodes[3];
                        } else {
                            // no more piles - get out
                            next_edit = null;
                            console.log("reached last pile.");
                        }
                    }
                }
                if (next_edit) {
                    console.log("next edit: " + next_edit.id);
                    next_edit.childNodes[5].click();
                }
            }
        },
        // user has moved out of the current adaptation input field
        unselectedAdaptation: function (event) {
            $(event.currentTarget).hide();
            //var newValue = $(event.currentTarget).val();
            if ($(event.currentTarget.previousElementSibling).html() !==
                    $(event.currentTarget).val()) {
                // value has changed -- update
            }
            // update the text with the new input value
            $(event.currentTarget.previousElementSibling).html($(event.currentTarget).val());
            $(event.currentTarget.previousElementSibling).show();
            if (selectedStart !== null) {
                // there was an old selection -- remove the ui-selected class
                $("div").removeClass("ui-selecting ui-selected");
                $("#Placeholder").prop('disabled', true);
                $("#Retranslation").prop('disabled', true);
                $("#Phrase").prop('disabled', true);
            }
        }
    });

});