/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts"/>
/// <reference path="./browser.d.ts"/>
/// <reference path="./util.ts"/>

/**
 * Loaded dynamically from /js/post-menu-data.js with content generated by
 * /views/post-menu-data.hbs
 */
declare const postMenuData: PostMenu;

/**
 * Menu data are loaded in menu-script.hbs referenced as /js/menu-data.js
 * only available on post pages. The menu shows three columns
 *
 * - menu-roots
 * - menu-categories
 * - menu-posts
 *
 * that have their HTML contents refreshed depending on clicks.
 */
$(function() {
   const eventCategory = 'Post Menu';
   const css = 'selected';
   const $button = $('#post-menu-button');
   const $menu = $('#post-menu');
   const $rootList = $('#menu-roots');
   const $categoryList = $('#menu-categories');
   const $postList = $('#menu-posts');
   const $description = $('#post-description');

   // default root category
   let selection = util.setting.menuCategory;
   if (selection == null) {
      selection = ['When', null];
   }

   // handle click on main menu button
   $button
      .one('click', () => {
         // populate menu on first click
         for (const root in postMenuData.category) {
            const $li = $('<li>').text(root);
            $rootList.append($li);
            if (root == selection[0]) {
               $li.addClass(css);
               loadSubcategories(selection);
            }
         }
         util.log.event(eventCategory, 'Open');
      })
      .click(toggleMenu);

   // handle click on root category
   $rootList.on('click', 'li', function(this: HTMLElement, e: JQuery.Event) {
      e.stopPropagation();
      const $li = $(this);
      selection = [$li.text(), null];
      menuSelect($rootList, $li, loadSubcategories, selection);
   });

   // handle click on subcategory
   $categoryList.on('click', 'li', function(
      this: HTMLElement,
      e: JQuery.Event
   ) {
      e.stopPropagation();
      const $li = $(this);
      selection[1] = $li.text();
      menuSelect($categoryList, $li, loadPosts, selection);
   });

   // handle click on post title
   $postList
      .on('click', 'li.post', showSelection)
      .on('mouseover', 'li.post', function(this: HTMLElement) {
         $description.html($(this).data('description'));
      })
      .on('mouseout', function() {
         $description.empty();
      });

   // always hide menu when clicking anywhere else on the screen
   $('html').click(function(e: JQuery.Event) {
      toggleMenu(e, true);
   });

   /**
    * Toggle menu visibility
    */
   function toggleMenu(event?: JQuery.Event, forceHide?: boolean) {
      const $up = $button.find('.material-icons.expand_less');
      const $down = $button.find('.material-icons.expand_more');
      const show = function() {
         $button.addClass(css);
         $menu.show();
         $up.show();
         $down.hide();
      };
      const hide = function() {
         $button.removeClass(css);
         $menu.hide();
         $up.hide();
         $down.show();
      };

      if (event) {
         event.stopPropagation();
      }

      if (forceHide === undefined) {
         forceHide = $button.hasClass(css);
      }
      if (forceHide) {
         hide();
      } else {
         show();
      }
   }

   /**
    * Navigate to clicked post.
    */
   function showSelection(this: HTMLElement) {
      window.location.href = '/' + $(this).data('slug');
      toggleMenu();
      util.log.event(eventCategory, 'Click Post');
   }

   /**
    * Apply CSS to show item clicked and use supplied loader to display child
    * items.
    *
    * - `$list` column containing the clicked item
    * - `$clicked` clicked element
    * - `loader` method to load child elements (`loadSubcategories` or `loadPosts`)
    * - `selected` text values of selections to this point
    */
   function menuSelect(
      $list: JQuery,
      $clicked: JQuery,
      loader: (selected: string[]) => void,
      selected: string[]
   ) {
      $list.find('li').removeClass(css);
      loader(selected);
      $clicked.addClass(css);
      util.setting.menuCategory = selected;
   }

   /**
    * Build category HTML when root item is clicked.
    */
   function loadSubcategories(selected: string[]) {
      const subcategories = postMenuData.category[selected[0]];

      $categoryList.empty();

      if (selected[1] == null) {
         selected[1] = subcategories[0].title;
      }

      for (let i = 0; i < subcategories.length; i++) {
         const $li = $('<li>').text(subcategories[i].title);
         $categoryList.append($li);
         if (subcategories[i].title == selected[1]) {
            $li.addClass(css);
            loadPosts(selected);
         }
      }
   }

   /**
    * Build post HTML from separately loaded `postMenuData` when subcategory
    * is clicked.
    */
   function loadPosts(selected: string[]) {
      const subcategories = postMenuData.category[selected[0]];

      // reset list of posts in third column
      $postList.empty();

      for (let i = 0; i < subcategories.length; i++) {
         if (subcategories[i].title == selected[1]) {
            const ids = subcategories[i].posts;

            for (let j = 0; j < ids.length; j++) {
               let post = postMenuData.post[ids[j]];
               let title = post.title;

               if (
                  post.part &&
                  j < ids.length - 1 &&
                  title == postMenuData.post[ids[j + 1]].title
               ) {
                  // found part in series followed by at least one more part in the same series
                  const $ol = $('<ol>');

                  while (
                     j < ids.length &&
                     postMenuData.post[ids[j]].title == title
                  ) {
                     post = postMenuData.post[ids[j]];

                     $ol.prepend(
                        $('<li>')
                           .addClass('post')
                           .attr('value', post.part)
                           .html(post.subTitle)
                           .data('description', post.description)
                           .data('slug', post.slug)
                     );

                     j++;
                  }

                  j--;

                  post = postMenuData.post[ids[j]];

                  $postList.append(
                     $('<li>')
                        .addClass('series')
                        .html(
                           '<span class="mode-icon ' +
                              post.icon +
                              '"></span>' +
                              post.title
                        )
                        .append($ol)
                  );
               } else {
                  // if series part is orphaned within a tag then show full title
                  if (post.part) {
                     title += ': ' + post.subTitle;
                  }

                  $postList.append(
                     $('<li>')
                        .addClass('post')
                        .html(
                           '<span class="mode-icon ' +
                              post.icon +
                              '"></span>' +
                              title
                        )
                        .data('description', post.description)
                        .data('slug', post.slug)
                  );
               }
            }
         }
      }
   }
});
