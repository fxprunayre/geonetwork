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

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        //        registry.addViewController("/").setViewName("home");
        registry.addViewController("/home").setViewName("home");
        registry.addViewController("/signin").setViewName("signin");
        List<String> jsAppList = List.of("/");

        jsAppList.forEach(app -> {
            String indexPath = "forward:" + app + "index.html";
            registry.addViewController(app + "{path1:[a-zA-Z0-9_-]+}").setViewName(indexPath);
            registry.addViewController(app + "{path1}/{path2:[a-zA-Z0-9_-]+}").setViewName(indexPath);
            registry.addViewController(app + "{path1}/{path2}/{path3:[a-zA-Z0-9_-]+}")
                    .setViewName(indexPath);
        });
    }
}
