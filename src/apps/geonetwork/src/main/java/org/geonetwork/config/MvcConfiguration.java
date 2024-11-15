/*
 * (c) 2003 Open Source Geospatial Foundation - all rights reserved
 * This code is licensed under the GPL 2.0 license,
 * available at the root application directory.
 */
package org.geonetwork.config;

import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** MVC configuration. */
@Configuration
public class MvcConfiguration implements WebMvcConfigurer {

    /**
     * Add view controllers.
     *
     * <p>For Angular apps, redirect all paths to index.html which is then handled by Angular routing. More levels may
     * be required ?.
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        List<String> jsAppList = List.of("/webcomponents/", "/");
        jsAppList.forEach(app -> {
            registry.addViewController(app + "{path1:[a-zA-Z0-9_-]+}").setViewName("forward:" + app + "index.html");
            registry.addViewController(app + "{path1}/{path2:[a-zA-Z0-9_-]+}")
                    .setViewName("forward:" + app + "index.html");
            registry.addViewController(app + "{path1}/{path2}/{path3:[a-zA-Z0-9_-]+}")
                    .setViewName("forward:" + app + "index.html");
        });
        registry.addViewController("/signin").setViewName("signin");
    }
}
