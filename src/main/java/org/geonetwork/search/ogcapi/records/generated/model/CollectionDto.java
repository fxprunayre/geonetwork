/*
 * (c) 2003 Open Source Geospatial Foundation - all rights reserved
 * This code is licensed under the GPL 2.0 license,
 * available at the root application directory.
 */

package org.geonetwork.search.ogcapi.records.generated.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Generated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** CollectionDto */
@JsonTypeName("collection")
@JacksonXmlRootElement(localName = "CollectionDto")
@XmlRootElement(name = "CollectionDto")
@XmlAccessorType(XmlAccessType.FIELD)
@Generated(
    value = "org.openapitools.codegen.languages.SpringCodegen",
    date = "2024-07-03T16:51:11.791047085+02:00[Europe/Paris]",
    comments = "Generator version: 7.6.0")
public class CollectionDto {

  private String id;

  private String title;

  private String description;

  @Valid private List<@Valid LinkDto> links = new ArrayList<>();

  private ExtentDto extent;

  private String itemType = "feature";

  @Valid
  private List<String> crs =
      new ArrayList<>(List.of("http://www.opengis.net/def/crs/OGC/1.3/CRS84"));

  public CollectionDto() {
    super();
  }

  /** Constructor with only required parameters */
  public CollectionDto(String id, List<@Valid LinkDto> links) {
    this.id = id;
    this.links = links;
  }

  /** Create a builder with no initialized field (except for the default values). */
  public static Builder builder() {
    return new Builder();
  }

  public CollectionDto id(String id) {
    this.id = id;
    return this;
  }

  /**
   * identifier of the collection used, for example, in URIs
   *
   * @return id
   */
  @NotNull
  @Schema(
      name = "id",
      example = "address",
      description = "identifier of the collection used, for example, in URIs",
      requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("id")
  @JacksonXmlProperty(localName = "id")
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public CollectionDto title(String title) {
    this.title = title;
    return this;
  }

  /**
   * human readable title of the collection
   *
   * @return title
   */
  @Schema(
      name = "title",
      example = "address",
      description = "human readable title of the collection",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("title")
  @JacksonXmlProperty(localName = "title")
  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public CollectionDto description(String description) {
    this.description = description;
    return this;
  }

  /**
   * a description of the features in the collection
   *
   * @return description
   */
  @Schema(
      name = "description",
      example = "An address.",
      description = "a description of the features in the collection",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("description")
  @JacksonXmlProperty(localName = "description")
  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public CollectionDto links(List<@Valid LinkDto> links) {
    this.links = links;
    return this;
  }

  public CollectionDto addLinksItem(LinkDto linksItem) {
    if (this.links == null) {
      this.links = new ArrayList<>();
    }
    this.links.add(linksItem);
    return this;
  }

  /**
   * Get links
   *
   * @return links
   */
  @NotNull
  @Valid
  @Schema(
      name = "links",
      example =
          "[{href=http://data.example.com/buildings, rel=item},"
              + " {href=http://example.com/concepts/buildings.html, rel=describedby,"
              + " type=text/html}]",
      requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("links")
  @JacksonXmlProperty(localName = "links")
  public List<@Valid LinkDto> getLinks() {
    return links;
  }

  public void setLinks(List<@Valid LinkDto> links) {
    this.links = links;
  }

  public CollectionDto extent(ExtentDto extent) {
    this.extent = extent;
    return this;
  }

  /**
   * Get extent
   *
   * @return extent
   */
  @Valid
  @Schema(name = "extent", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("extent")
  @JacksonXmlProperty(localName = "extent")
  public ExtentDto getExtent() {
    return extent;
  }

  public void setExtent(ExtentDto extent) {
    this.extent = extent;
  }

  public CollectionDto itemType(String itemType) {
    this.itemType = itemType;
    return this;
  }

  /**
   * indicator about the type of the items in the collection (the default value is 'feature').
   *
   * @return itemType
   */
  @Schema(
      name = "itemType",
      description =
          "indicator about the type of the items in the collection (the default value is"
              + " 'feature').",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("itemType")
  @JacksonXmlProperty(localName = "itemType")
  public String getItemType() {
    return itemType;
  }

  public void setItemType(String itemType) {
    this.itemType = itemType;
  }

  public CollectionDto crs(List<String> crs) {
    this.crs = crs;
    return this;
  }

  public CollectionDto addCrsItem(String crsItem) {
    if (this.crs == null) {
      this.crs = new ArrayList<>(List.of("http://www.opengis.net/def/crs/OGC/1.3/CRS84"));
    }
    this.crs.add(crsItem);
    return this;
  }

  /**
   * the list of coordinate reference systems supported by the service
   *
   * @return crs
   */
  @Schema(
      name = "crs",
      example =
          "[http://www.opengis.net/def/crs/OGC/1.3/CRS84,"
              + " http://www.opengis.net/def/crs/EPSG/0/4326]",
      description = "the list of coordinate reference systems supported by the service",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("crs")
  @JacksonXmlProperty(localName = "crs")
  public List<String> getCrs() {
    return crs;
  }

  public void setCrs(List<String> crs) {
    this.crs = crs;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CollectionDto collection = (CollectionDto) o;
    return Objects.equals(this.id, collection.id)
        && Objects.equals(this.title, collection.title)
        && Objects.equals(this.description, collection.description)
        && Objects.equals(this.links, collection.links)
        && Objects.equals(this.extent, collection.extent)
        && Objects.equals(this.itemType, collection.itemType)
        && Objects.equals(this.crs, collection.crs);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, title, description, links, extent, itemType, crs);
  }

  @Override
  public String toString() {
    String sb =
        "class CollectionDto {\n"
            + "    id: "
            + toIndentedString(id)
            + "\n"
            + "    title: "
            + toIndentedString(title)
            + "\n"
            + "    description: "
            + toIndentedString(description)
            + "\n"
            + "    links: "
            + toIndentedString(links)
            + "\n"
            + "    extent: "
            + toIndentedString(extent)
            + "\n"
            + "    itemType: "
            + toIndentedString(itemType)
            + "\n"
            + "    crs: "
            + toIndentedString(crs)
            + "\n"
            + "}";
    return sb;
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }

  /** Create a builder with a shallow copy of this instance. */
  public Builder toBuilder() {
    Builder builder = new Builder();
    return builder.copyOf(this);
  }

  public static class Builder {

    private CollectionDto instance;

    public Builder() {
      this(new CollectionDto());
    }

    protected Builder(CollectionDto instance) {
      this.instance = instance;
    }

    protected Builder copyOf(CollectionDto value) {
      this.instance.setId(value.id);
      this.instance.setTitle(value.title);
      this.instance.setDescription(value.description);
      this.instance.setLinks(value.links);
      this.instance.setExtent(value.extent);
      this.instance.setItemType(value.itemType);
      this.instance.setCrs(value.crs);
      return this;
    }

    public Builder id(String id) {
      this.instance.id(id);
      return this;
    }

    public Builder title(String title) {
      this.instance.title(title);
      return this;
    }

    public Builder description(String description) {
      this.instance.description(description);
      return this;
    }

    public Builder links(List<@Valid LinkDto> links) {
      this.instance.links(links);
      return this;
    }

    public Builder extent(ExtentDto extent) {
      this.instance.extent(extent);
      return this;
    }

    public Builder itemType(String itemType) {
      this.instance.itemType(itemType);
      return this;
    }

    public Builder crs(List<String> crs) {
      this.instance.crs(crs);
      return this;
    }

    /**
     * returns a built CollectionDto instance.
     *
     * <p>The builder is not reusable (NullPointerException)
     */
    public CollectionDto build() {
      try {
        return this.instance;
      } finally {
        // ensure that this.instance is not reused
        this.instance = null;
      }
    }

    @Override
    public String toString() {
      return getClass() + "=(" + instance + ")";
    }
  }
}
