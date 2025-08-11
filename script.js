document.addEventListener('DOMContentLoaded', () => {
    // Select all main article sections that correspond to TOC links
    const articleSections = document.querySelectorAll('.article-body-section');
    // Select all links within the Table of Contents
    const tocLinks = document.querySelectorAll('.sidebar-toc ul li a');
    // Select the blue indicator bar element
    const tocIndicator = document.querySelector('.toc-indicator');
    // Select the <ul> element within the Table of Contents to use as a reference for positioning
    const tocContainerUl = document.querySelector('.sidebar-toc ul');

    // --- Dropdown Menu Logic ---
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');

    dropdownMenus.forEach(menu => {
        const indicator = menu.querySelector('.dropdown-indicator');
        const links = menu.querySelectorAll('a');

        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const linkRect = link.getBoundingClientRect();
                const menuRect = menu.getBoundingClientRect();

                // Calculate the position relative to the dropdown menu container
                const indicatorTop = linkRect.top - menuRect.top;
                const indicatorHeight = linkRect.height;

                // Update the indicator's position and size
                indicator.style.top = `${indicatorTop}px`;
                indicator.style.height = `${indicatorHeight}px`;
            });
        });
        
        // Hide the indicator when the mouse leaves the dropdown
        menu.addEventListener('mouseleave', () => {
             indicator.style.height = '0px';
        });
    });

    // --- Scroll Indicator Logic ---
    // Function to update the scroll indicator's position and highlight the active TOC link
    const updateScrollIndicator = () => {
        let activeSectionId = ''; // To store the ID of the currently active section

        // Iterate through each article section to determine which one is currently in view
        articleSections.forEach(section => {
            const rect = section.getBoundingClientRect(); // Get the size and position of the section relative to the viewport

            // Determine if the section is in the "active" zone (e.g., its top is within 100px from the viewport top)
            // Adjust the 100px offset as needed for visual preference, often aligning with the sticky header height
            const activationOffset = 100;

            if (rect.top <= activationOffset && rect.bottom >= activationOffset) {
                activeSectionId = section.id;
            }
        });

        // Fallback: If no section is perfectly in the activation zone (e.g., at the very top/bottom of the page, or in between sections),
        // find the section whose top edge is closest to the activation point, but is still visible.
        // This ensures an active state is always determined if content is on screen.
        if (!activeSectionId) {
             let closestSection = null;
             let smallestOffset = Infinity; // How close the section's top is to the activation line

             articleSections.forEach(section => {
                 const rect = section.getBoundingClientRect();
                 // Check if the section is currently anywhere in the viewport (even partially)
                 if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                     // Calculate the distance of the section's top from the activation line
                     const offset = Math.abs(rect.top - activationOffset);
                     if (offset < smallestOffset) {
                         smallestOffset = offset;
                         closestSection = section;
                     }
                 }
             });
             if (closestSection) {
                 activeSectionId = closestSection.id;
             }
        }


        // Remove the 'active' class from all Table of Contents links
        tocLinks.forEach(link => link.classList.remove('active'));

        // If an active section is found, update the corresponding TOC link and the scroll indicator
        if (activeSectionId) {
            // Find the TOC link that corresponds to the active article section
            const currentActiveLink = document.querySelector(`.sidebar-toc ul li a[href="#${activeSectionId}"]`);
            if (currentActiveLink) {
                currentActiveLink.classList.add('active'); // Add 'active' class to highlight the link

                // Calculate the position and height for the blue indicator bar
                const tocLinkRect = currentActiveLink.getBoundingClientRect();
                const tocContainerRect = tocContainerUl.getBoundingClientRect();

                // Calculate the 'top' position of the indicator relative to its parent `.toc-scroll-indicator` container.
                // This is the distance from the top of the <ul> element to the top of the active <li><a>.
                const indicatorTop = tocLinkRect.top - tocContainerRect.top;
                // The height of the indicator should match the height of the active <li><a>.
                const indicatorHeight = tocLinkRect.height;

                // Apply the calculated styles to the indicator
                tocIndicator.style.top = `${indicatorTop}px`;
                tocIndicator.style.height = `${indicatorHeight}px`;
            }
        } else {
             // If no section is determined to be active (e.g., at the very top of the page before any section is truly in view),
             // make the indicator disappear or move to a default hidden state.
             tocIndicator.style.height = '0px'; // Make it disappear
             tocIndicator.style.top = '0px'; // Reset its position
        }
    };

    // Add event listeners for scroll and resize events
    // These will trigger the `updateScrollIndicator` function, ensuring dynamic behavior.
    window.addEventListener('scroll', updateScrollIndicator);
    window.addEventListener('resize', updateScrollIndicator);

    // Initial call to set the indicator position and active link when the page first loads
    updateScrollIndicator();

    // Implement smooth scrolling when a Table of Contents link is clicked
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent the default instant jump behavior of anchor links

            // Get the target section's ID from the href attribute (remove the '#')
            const targetId = this.getAttribute('href').substring(1);
            // Find the actual target section element on the page
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Calculate the scroll position: target section's top offset - fixed header height (70px)
                // Adjust the headerOffset based on the actual combined height of your two-row header
                // Top row (5rem) + Bottom row (3.5rem) + border (1px) + border (1px) = 8.5rem + 2px.
                // 8.5rem * 16px (if 1rem=16px) = 136px.
                const headerOffset = 140; // Adjusted for the new bigger header.
                const elementPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth' // Enable smooth scrolling animation
                });
            }
        });
    });
});